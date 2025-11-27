from django.db import models

class ProjectWallet(models.Model):
    name = models.CharField(max_length=100)
    client_name = models.CharField(max_length=100, blank=True, null=True)

    allocated_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    spen_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def remaining_budget(self):
        return self.allocated_budget - self.spen_amount
    
    def __str__(self):
        return f"{self.name} (Remaining: {self.remaining_budget()})"
