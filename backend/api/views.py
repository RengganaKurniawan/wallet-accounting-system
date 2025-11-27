from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import BankAccount
from .serializers import (
    CompanyWalletSerializer,
    BankAccountSerializer,
    ProjectWalletSerializer,
    TransactionSerializer,
    TransferSerializer,
)

@api_view(['GET'])
def list_company_wallet(request):
    accounts = BankAccount.objects.all()
    serializer = CompanyWalletSerializer(accounts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_bank_accounts(request):
    accounts = BankAccount.objects.all()
    serializer = BankAccountSerializer(accounts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_project_wallet(request):
    accounts = BankAccount.objects.all()
    serializer = ProjectWalletSerializer(accounts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_transactions(request):
    accounts = BankAccount.objects.all()
    serializer = TransactionSerializer(accounts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_transfer(request):
    accounts = BankAccount.objects.all()
    serializer = TransferSerializer(accounts, many=True)
    return Response(serializer.data)

