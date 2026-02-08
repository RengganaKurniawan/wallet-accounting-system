from django.db import models, transaction
from django.core.exceptions import ValidationError
from .wallets import BankAccount
from .projects import ProjectWallet, ProjectItem

class Transaction(models.Model):
    TRANSACTION_TYPE = [
        ("IN", "Income"),
        ("OUT", "Expense"),
    ]

    account = models.ForeignKey(
        BankAccount, 
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    project = models.ForeignKey(
        ProjectWallet, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="transactions"
    )

    project_item = models.ForeignKey(
        ProjectItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="related_transactions"
    )

    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE)
    date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk is not None:
            return super().save(*args, **kwargs)
        
        if self.project_item and not self.project:
            self.project = self.project_item.project

        if self.project_item and self.project:
            if self.project_item.project != self.project:
                raise ValidationError(
                    f"Mismatch Error! The item '{self.project_item.name}' belongs to '{self.project_item.project.name}', "
                    f"but you are trying to assign it to '{self.project.name}'."
                )

        with transaction.atomic():
            account_obj = BankAccount.objects.select_for_update().get(pk=self.account.pk)

            project = None
            if self.project:
                project_obj = ProjectWallet.objects.select_for_update().get(pk=self.project.pk)
            
            # validations
            if self.amount <= 0:
                raise ValidationError("Transaction amount must be positive.")

            if self.transaction_type == "OUT" and not self.project:
                raise ValidationError("Expense transactions must belong to a project.")

            if self.transaction_type == "OUT":
                if account_obj.balance < self.amount:
                    raise ValidationError(
                        f"Insufficient funds in {account_obj.name}. "
                        f"Balance: {account_obj.balance}, Requested: {self.amount:,.2f}"
                    )
                
                if project_obj and project_obj.remaining_budget < self.amount:
                    raise ValidationError(
                        f"Over Budget! Project {project_obj.name} "
                        f"Only has {project_obj.remaining_budget:,.2f} remaining."
                    )

                account_obj.balance -= self.amount
            elif self.transaction_type == "IN":
                account_obj.balance += self.amount
            
            account_obj.save()

            super().save(*args, **kwargs)


    def __str__(self):
        dest = f" -> {self.project.name}" if self.project else ""
        return f"[{self.transaction_type}] {self.account.name} : {self.amount}{dest}"

class Transfer(models.Model):
    
    from_account = models.ForeignKey(
        BankAccount, related_name="transfer_out",
        on_delete=models.CASCADE
    )

    to_account = models.ForeignKey(
        BankAccount, related_name="transfer_in",
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk is not None:
            return super().save(*args, **kwargs)
        
        with transaction.atomic():
            src = BankAccount.objects.select_for_update().get(pk=self.from_account.pk)
            dst = BankAccount.objects.select_for_update().get(pk=self.to_account.pk)

            if self.amount <= 0:
                raise ValidationError("Transfer amount must be positive.")

            if src.balance < self.amount:
                raise ValidationError(f"Insufficient funds in {src.name} to transfer {self.amount}.")
            
            src.balance -= self.amount
            dst.balance += self.amount
            
            src.save()
            dst.save()

            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.from_account.name} -> {self.to_account.name} : {self.amount}"
