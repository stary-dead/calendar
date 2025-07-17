import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from events.models import Category


class Command(BaseCommand):
    help = 'Create initial categories and superuser if they do not exist'

    def handle(self, *args, **options):
        # Create categories
        categories = [
            Category.CAT_1,
            Category.CAT_2,
            Category.CAT_3,
        ]
        
        created_count = 0
        
        for cat_name in categories:
            category, created = Category.objects.get_or_create(name=cat_name)
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {cat_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {cat_name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Categories: Created {created_count} new categories.')
        )
        
        # Create superuser if flag is set
        if os.environ.get('CREATE_DEFAULT_SUPERUSER', '').lower() == 'true':
            if not User.objects.filter(is_superuser=True).exists():
                username = os.environ.get('DEFAULT_SUPERUSER_USERNAME', 'admin')
                password = os.environ.get('DEFAULT_SUPERUSER_PASSWORD', 'admin')
                email = os.environ.get('DEFAULT_SUPERUSER_EMAIL', 'admin@example.com')
                
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Created default superuser: {username}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Superuser already exists, skipping creation')
                )
        else:
            self.stdout.write(
                self.style.WARNING('CREATE_DEFAULT_SUPERUSER not set to true, skipping superuser creation')
            )
