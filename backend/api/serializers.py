from rest_framework import serializers
from .models import CompanyWallet, BankAccount, ProjectWallet, Transaction, Transfer, ProjectItem

class CompanyWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyWallet
        fields = "__all__"

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = "__all__"

class ProjectItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = ProjectItem
        fields = ['id', 'name', 'category', 'quantity', 'unit_price', 'total_price']

class ProjectWalletSerializer(serializers.ModelSerializer):
    items = ProjectItemSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectWallet
        fields = "__all__"

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transfer
        fields = "__all__"
