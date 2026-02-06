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
        fields = [
            'id', 'category', 'name', 'description',
            'qty_amount', 'qty_unit',
            'volume_amount', 'volume_unit',
            'period_amount', 'period_unit',
            'unit_price', 'total_price'
        ]

class ProjectWalletSerializer(serializers.ModelSerializer):
    items = ProjectItemSerializer(many=True, read_only=True)

    category_totals = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = ProjectWallet
        fields = "__all__"
    
    def get_grand_total(self, obj):
        return sum(item.total_price for item in obj.items.all())
    
    def get_category_totals(self, obj):
        totals = {}
        for item in obj.items.all():
            cat = item.category
            if cat not in totals:
                totals[cat] = 0
            totals[cat] += item.total_price
        return totals

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transfer
        fields = "__all__"
