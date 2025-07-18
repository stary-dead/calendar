# Generated by Django 4.2.7 on 2025-07-12 12:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booked_at', models.DateTimeField(auto_now_add=True)),
                ('time_slot', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='booking', to='events.timeslot')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-booked_at'],
                'indexes': [models.Index(fields=['user'], name='bookings_bo_user_id_0e7f91_idx'), models.Index(fields=['booked_at'], name='bookings_bo_booked__6ab0fd_idx')],
            },
        ),
    ]
