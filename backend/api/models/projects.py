from django.db import models
from django.db.models import Sum, F
from django.core.exceptions import ValidationError
from .wallets import BankAccount

class ProjectWallet(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active (Funds Locked)"),
        ("COMPLETED", "Completed (Funds Released)"),
        ("CANCELLED", "Cancelled"),
    ]

    name = models.CharField(max_length=100)
    client_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    allocated_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} (RAB: {self.allocated_budget})"
    
    @property
    def total_spent(self):
        """Calculates total expenses for this project from Transactions"""
        from .transactions import Transaction
        spent = Transaction.objects.filter(project=self, type="OUT").aggregate(Sum('amount'))['amount__sum']
        return spent or 0
    
    @property
    def remaining_budget(self):
        """RAB - Spent"""
        return self.allocated_budget - self.total_spent
    
    @classmethod
    def check_funds_availability(cls, new_rab_amount):
        """
        Global check:
        Total Cash in Banks - Total Allocated to Active Projects
        """
        total_assets = BankAccount.objects.aggregate(Sum('balance'))['balance__sum'] or 0

        locked_funds = cls.objects.filter(status="ACTIVE").aggregate(Sum('allocated_budget'))['allocated_budget__sum'] or 0

        available_free_cash = total_assets - locked_funds

        if new_rab_amount > available_free_cash:
            return False, available_free_cash
        return True, available_free_cash

class ProjectItem(models.Model):
    project = models.ForeignKey(
        ProjectWallet,
        related_name="items",
        on_delete=models.CASCADE
    )
    # basic info
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # quantity
    qty_amount = models.IntegerField(default=1, verbose_name="Qty")
    qty_unit = models.CharField(max_length=50, default="pax")

    # volume
    volume_amount = models.IntegerField(default=1, verbose_name="Vol")
    volume_unit = models.CharField(max_length=50, default="day")

    # period
    period_amount = models.IntegerField(default=1, verbose_name="Period")
    period_unit = models.CharField(max_length=50, default="event")

    # prince
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)    

    @property
    def total_price(self):

        if self.unit_price is None or self.qty_amount is None:
            return 0

        return self.qty_amount * self.volume_amount * self.period_amount * self.unit_price

    def save(self, *args, **kwargs):
        this_item_cost = self.total_price

        other_items = self.project.items.exclude(pk=self.pk).aggregate(
            total=Sum(
                F('qty_amount') * F('volume_amount') * F('period_amount') * F('unit_price')
            )
        )
        other_items_cost = other_items['total'] or 0

        # validation
        total_planned_cost = other_items_cost + this_item_cost

        if total_planned_cost > self.project.allocated_budget:
            remaining = self.project.allocated_budget - other_items_cost
            raise ValidationError(
                f"Budget Exceeded! This item cost {this_item_cost:,.2f}, but you only have {remaining:,.2f} remaining in the Project Budget." 
            )
        
        super().save(*args,  **kwargs)

    def __str__(self):
        return f"{self.name} - {self.total_price:,.2f}"
