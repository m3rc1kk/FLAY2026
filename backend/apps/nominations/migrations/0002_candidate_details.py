from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nominations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='candidate',
            name='details',
            field=models.TextField(blank=True),
        ),
    ]
