from django.db import models

class CompanyWallet(models.Model):
    name = models.CharField(max_length=50, default='Main Company Wallet')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.name} - Rp. {self.balance:,.2f}"

class BankAccount(models.Model):
    name = models.CharField(max_length=50, unique=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)

    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.name} - Rp. {self.balance:,.2f}"
