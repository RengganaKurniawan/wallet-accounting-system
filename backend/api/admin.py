from django.contrib import admin
from .models import CompanyWallet, BankAccount, ProjectWallet, Transaction, Transfer, ProjectItem

class ProjectItemInLine(admin.TabularInline):
    model = ProjectItem
    extra = 1

class ProjectWalletAdmin(admin.ModelAdmin):
    inlines = [ProjectItemInLine]
    list_display = ('name', 'allocated_budget', 'status')

admin.site.register(CompanyWallet)
admin.site.register(BankAccount)
admin.site.register(ProjectWallet, ProjectWalletAdmin)
admin.site.register(Transaction)
admin.site.register(Transfer)
