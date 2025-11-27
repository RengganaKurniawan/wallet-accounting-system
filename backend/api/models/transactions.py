from django.db import models
from .wallets import BankAccount

class Transaction(models.Model):
    TRANSACTION_TYPE = [
        ("IN", "Income"),
        ("OUT", "Expense"),
        ("TRANSFER", "Transfer"),
    ]

    source_account = models.ForeignKey(
        BankAccount, related_name="source_transactions",
        on_delete=models.SET_NULL, null=True, blank=True
    )
    dest_account = models.ForeignKey(
        BankAccount, related_name="dest_transactions",
        on_delete=models.SET_NULL, null=True, blank=True
    )

    project = models.ForeignKey(
        "api.ProjectWallet",
        on_delete=models.SET_NULL,
        null=True, blank=True
    )

    amount = models.DecimalField(max_digits=15, decimal_places=2)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPE)
    description = models.TextField(blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} {self.amount} on {self.date}"

class Transfer(models.Model):
    from_account = models.ForeignKey(
        BankAccount, related_name="transfers_out",
        on_delete=models.CASCADE
    )
    to_account = models.ForeignKey(
        BankAccount, related_name="transfers_in",
        on_delete=models.CASCADE
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} from {self.from_account} to {self.to_account}"
