from rest_framework import viewsets, mixins
from .models import (
    BankAccount,
    CompanyWallet,
    ProjectWallet,
    ProjectItem,
    Transaction,
    Transfer
)
from .serializers import (
    CompanyWalletSerializer,
    BankAccountSerializer,
    ProjectWalletSerializer,
    ProjectItemSerializer,
    TransactionSerializer,
    TransferSerializer,
)

class CompanyWalletViewSet(viewsets.ModelViewSet):
    queryset = CompanyWallet.objects.all()
    serializer_class = CompanyWalletSerializer

class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer

class ProjectWalletViewSet(viewsets.ModelViewSet):
    queryset = ProjectWallet.objects.all()
    serializer_class = ProjectWalletSerializer

class ProjectItemViewSet(viewsets.ModelViewSet):
    queryset = ProjectItem.objects.all()
    serializer_class = ProjectItemSerializer

class TransactionViewSet(mixins.CreateModelMixin,
                         mixins.ListModelMixin,
                         mixins.RetrieveModelMixin,
                         mixins.DestroyModelMixin,
                         viewsets.GenericViewSet):
    
    queryset = Transaction.objects.all().order_by('-date', '-id')
    serializer_class = TransactionSerializer

class TransferViewSet(viewsets.ModelViewSet):
    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer
