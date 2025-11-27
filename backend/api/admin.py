from django.contrib import admin
from .models import CompanyWallet, BankAccount, ProjectWallet, Transaction, Transfer

admin.site.register(CompanyWallet)
admin.site.register(BankAccount)
admin.site.register(ProjectWallet)
admin.site.register(Transaction)
admin.site.register(Transfer)
