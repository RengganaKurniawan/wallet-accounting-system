from django.contrib import admin
from .models import CompanyWallet, BankAccount, ProjectWallet, Transaction, Transfer, ProjectItem

class ProjectItemInLine(admin.TabularInline):
    model = ProjectItem
    extra = 1
    fields = (
        'category', 'sub_category', 'name', 'description',
        'qty_amount', 'qty_unit',
        'volume_amount', 'period_unit',
        'unit_price', 'total_price_display'
    )
    readonly_fields = ('total_price_display',)

    def total_price_display(self, obj):
        if obj.total_price:
            return f"{obj.total_price:,.2f}"
        return "0"
    total_price_display.short_description = "Sub Total"

class ProjectWalletAdmin(admin.ModelAdmin):
    inlines = [ProjectItemInLine]
    list_display = ('name', 'client_name', 'allocated_budget', 'status', 'total_planned_cost')

    def total_planned_cost(self, obj):
        total = sum(item.total_price for item in obj.items.all())
        return f"{total:,.2f}"
    total_planned_cost.short_description = "Total Planned (RAB)"

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'transaction_type', 'date', 'account', 'project', 'project_item')
    list_filter = ('transaction_type', 'date', 'project') 
    search_fields = ('description', 'project__name')
    
    readonly_fields = ('date',)

    fieldsets = (
        ('Basic Info', {
            'fields': ('description', 'amount', 'transaction_type')
        }),
        ('Money Source', {
            'fields': ('account',)
        }),
        ('Project Allocation (Optional)', {
            'fields': ('project', 'project_item')
        }),
        ('System Info', {
            'fields': ('date',)
        }),
    )

admin.site.register(CompanyWallet)
admin.site.register(BankAccount)
admin.site.register(ProjectWallet, ProjectWalletAdmin)
admin.site.register(Transfer)
