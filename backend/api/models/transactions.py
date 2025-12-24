from django.db import models, transaction
from django.core.exceptions import ValidationError
from .wallets import BankAccount
from .projects import ProjectWallet

class Transaction(models.Model):
    TRANSACTION_TYPE = [
        ("IN", "Income (Add to Bank)"),
        ("OUT", "Expense (Deduct from Bank & Project)"),
        ("TRANSFER", "Internal Transfer"),
    ]

    bank_account = models.ForeignKey(
        BankAccount, related_name="transactions",
        on_delete=models.CASCADE
    )

    project = models.ForeignKey(
        ProjectWallet, related_name="transactions",
        on_delete=models.SET_NULL, null=True, blank=True
    )

    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE)
    description = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk is not None:
            return super().save(*args, **kwargs)

        with transaction.atomic():
            account = BankAccount.objects.select_for_update().get(pk=self.bank_account.pk)

            project = None
            if self.project:
                project = ProjectWallet.objects.select_for_update().get(pk=self.project.pk)                

            if self.amount <= 0:
                raise ValidationError("Transaction amount must be positive.")

            if self.transaction_type == "OUT" and not project:
                raise ValidationError("Expense transactions must belong to a project.")

            if self.transaction_type == "OUT":
                if account.balance < self.amount:
                    raise ValidationError(
                        f"Insufficient funds in {account.name}. "
                        f"Balance: {account.balance}, Requested: {self.amount}"
                    )
                
                if project and project.remaining_budget < self.amount:
                    raise ValidationError(
                        f"Over Budget! Project {project.name} "
                        f"Only has {project.remaining_budget} remaining."
                    )

                account.balance -= self.amount
                account.save()
            elif self.transaction_type == "IN":
                account.balance += self.amount
                account.save()
            elif self.transaction_type == "TRANSFER":
                raise ValidationError("Use the dedicated Transfer model for internal transfers.")
            
            super().save(*args, **kwargs)


    def __str__(self):
        dest = f" -> {self.project.name}" if self.project else ""
        return f"[{self.transaction_type}] {self.bank_account.name} : {self.amount}{dest}"

