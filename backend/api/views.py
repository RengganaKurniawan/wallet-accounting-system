from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    BankAccount,
    CompanyWallet,
    ProjectWallet,
    Transaction,
    Transfer
)

from .serializers import (
    CompanyWalletSerializer,
    BankAccountSerializer,
    ProjectWalletSerializer,
    TransactionSerializer,
    TransferSerializer,
)

@api_view(['GET'])
def list_company_wallet(request):
    wallets = CompanyWallet.objects.all()
    serializer = CompanyWalletSerializer(wallets, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_bank_accounts(request):
    accounts = BankAccount.objects.all()
    serializer = BankAccountSerializer(accounts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_project_wallet(request):
    projects = ProjectWallet.objects.all()
    serializer = ProjectWalletSerializer(projects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_transactions(request):
    transactions = Transaction.objects.all()
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_transfer(request):
    transfers = Transfer.objects.all()
    serializer = TransferSerializer(transfers, many=True)
    return Response(serializer.data)

