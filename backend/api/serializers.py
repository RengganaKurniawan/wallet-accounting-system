from rest_framework import serializers
from .models import CompanyWallet, BankAccount, ProjectWallet, Transaction, Transfer, ProjectItem
from django.db.models import Sum
from django.core.exceptions import ValidationError as DjangoValidationError

class CompanyWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyWallet
        fields = "__all__"

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = "__all__"

class SimpleTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'amount', 'transaction_type', 'account']

class ProjectItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField() # for Plan RAB
    realized_spend = serializers.SerializerMethodField() # actual expenses
    margin = serializers.SerializerMethodField()
    history = SimpleTransactionSerializer(source='related_transactions', many=True, read_only=True)
    
    class Meta:
        model = ProjectItem
        fields = [
            'id', 'project', 'category', 'sub_category', 'name', 'description',
            'qty_amount', 'qty_unit',
            'volume_amount', 'volume_unit',
            'period_amount', 'period_unit',
            'unit_price', 'total_price',
            'realized_spend', 'history',
            'margin'
        ]
    
    def get_realized_spend(self, obj):
        spent = obj.related_transactions.filter(transaction_type="OUT").aggregate(Sum('amount'))['amount__sum']
        return spent or 0
    
    def get_margin(self, obj):
        real_spent = self.get_realized_spend(obj)
        return obj.total_price - real_spent
    
    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)

class ProjectWalletSerializer(serializers.ModelSerializer):
    items = ProjectItemSerializer(many=True, read_only=True)

    category_totals = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    total_spent = serializers.ReadOnlyField()
    remaining_budget = serializers.ReadOnlyField()

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
    
    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"detail": e.messages})

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

    def validate(self, data):
        if data['transaction_type'] == 'OUT':
            wallet = data['account']
            amount = data['amount']

            if wallet.balance < amount:
                raise serializers.ValidationError(
                    f"Insufficient funds! {wallet.name} only has Rp {wallet.balance:,.0f}"
                )
        
        return data

class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transfer
        fields = "__all__"
