import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nominations', '0002_candidate_details'),
        ('voting', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='nominations.candidate')),
                ('nomination', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='nominations.nomination')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'constraints': [models.UniqueConstraint(fields=('user', 'nomination'), name='unique_prediction_per_nomination')],
            },
        ),
    ]
