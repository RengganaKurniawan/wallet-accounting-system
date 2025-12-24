from django.db import models
    
class BankAccount(models.Model):
    BANK_CHOICES = [
        ("BCA", "Bank Central Asia"),
        ("Mandiri", "Bank Mandiri"),
        ("BRI", "Bank Rakyat Indonesia"),
        ("CASH", "Cash on hand"),
    ]

    name = models.CharField(max_length=50, choices=BANK_CHOICES, unique=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)

    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.name} - Rp. {self.balance:,.2f}"
