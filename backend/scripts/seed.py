import sys
import os

# Add the project root to sys.path to locate the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.database.models import User, UserRole, Device, DeviceStatus, Base
from app.utils.auth import hash_password


def seed_database():
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@devicepulse.com",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            print("Successfully seeded Admin user (username: admin, password: admin123)")
        else:
            print("Admin user already exists.")

        # 2. Seed Mock Devices
        if db.query(Device).count() == 0:
            mock_devices = [
                Device(
                    name="Core Router",
                    ip_address="192.168.1.1",
                    type="Router",
                    status=DeviceStatus.UP,
                    description="Main gateway and border router",
                ),
                Device(
                    name="Central Switch",
                    ip_address="192.168.1.2",
                    type="Switch",
                    status=DeviceStatus.UP,
                    description="Core office network switch",
                ),
                Device(
                    name="Primary DB Server",
                    ip_address="192.168.1.10",
                    type="Server",
                    status=DeviceStatus.UP,
                    description="Production PostgreSQL server cluster",
                ),
                Device(
                    name="Backup DB Server",
                    ip_address="192.168.1.11",
                    type="Server",
                    status=DeviceStatus.DOWN,
                    description="Standby replication database server",
                ),
                Device(
                    name="Web Gateway",
                    ip_address="192.168.1.20",
                    type="Gateway",
                    status=DeviceStatus.UP,
                    description="Nginx reverse proxy and load balancer",
                ),
            ]
            db.bulk_save_objects(mock_devices)
            db.commit()
            print(f"Successfully seeded {len(mock_devices)} mock devices.")
        else:
            print("Devices already exist in database, skipping device seeding.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting database seeding...")
    seed_database()
    print("Database seeding finished!")
