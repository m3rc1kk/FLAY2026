from django.db import models


class Nomination(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class Candidate(models.Model):
    nomination = models.ForeignKey(Nomination, on_delete=models.CASCADE, related_name='candidates')
    name = models.CharField(max_length=150)
    photo = models.ImageField(upload_to='candidates/%Y/%m/', blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.name} ({self.nomination})'
