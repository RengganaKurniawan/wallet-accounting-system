from django.contrib import admin
from .models import CompanyWallet, BankAccount, ProjectWallet, Transaction, Transfer, ProjectItem

class ProjectItemInLine(admin.TabularInline):
    model = ProjectItem
    extra = 1
    fields = (
        'category', 'name', 'description',
        'qty_amount', 'qty_unit',
        'volume_amount', 'period_unit',
        'unit_price', 'total_price_display'
    )
    readonly_fields = ('total_price_display',)

    def total_price_display(self, obj):
        return f"{obj.total_price:,.2f}"
    total_price_display.short_description = "Sub Total"

class ProjectWalletAdmin(admin.ModelAdmin):
    inlines = [ProjectItemInLine]
    list_display = ('name', 'client_name', 'allocated_budget', 'status', 'total_spent_display')

    def total_spent_display(self, obj):
        total = sum(item.total_price for item in obj.items.all())
        return f"{total:,.2f}"
    total_spent_display.short_description = "Total Planned Cost"

admin.site.register(CompanyWallet)
admin.site.register(BankAccount)
admin.site.register(ProjectWallet, ProjectWalletAdmin)
admin.site.register(Transaction)
admin.site.register(Transfer)
