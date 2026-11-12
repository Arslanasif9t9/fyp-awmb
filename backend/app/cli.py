"""Small admin commands.  Run:  python -m app.cli create-admin"""
import argparse
import getpass
import sys

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from .database import SessionLocal
from .models import User
from .security import hash_password


def create_admin(email: str | None, name: str | None) -> int:
    email = (email or input("Admin email: ")).strip().lower()
    if "@" not in email:
        print("That does not look like an email.")
        return 1

    try:
        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.email == email))
            if user:
                print(f"{email} already exists. It will be made admin.")
                new_pw = getpass.getpass("New password (Enter to keep current): ")
                user.role = "admin"
                user.status = "active"
                if new_pw:
                    if len(new_pw) < 8:
                        print("Password must be at least 8 characters.")
                        return 1
                    user.password_hash = hash_password(new_pw)
            else:
                name = (name or input("Admin name: ")).strip() or "Admin"
                pw = getpass.getpass("Password (min 8 characters): ")
                if len(pw) < 8:
                    print("Password must be at least 8 characters.")
                    return 1
                if pw != getpass.getpass("Repeat password: "):
                    print("Passwords do not match.")
                    return 1
                db.add(
                    User(
                        name=name,
                        email=email,
                        password_hash=hash_password(pw),
                        role="admin",
                    )
                )
            db.commit()
    except SQLAlchemyError as exc:
        print("Database error. Did you run 'awmb migrate' first?")
        print(f"Details: {exc.__class__.__name__}")
        return 1

    print(f"Done. {email} is now an admin.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="command", required=True)
    admin = sub.add_parser("create-admin", help="Create or promote an admin user")
    admin.add_argument("--email")
    admin.add_argument("--name")
    args = parser.parse_args()

    if args.command == "create-admin":
        return create_admin(args.email, args.name)
    return 1


if __name__ == "__main__":
    sys.exit(main())
