from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyWalletViewSet,
    BankAccountViewSet,
    ProjectWalletViewSet,
    ProjectItemViewSet,
    TransactionViewSet,
    TransferViewSet
)

router = DefaultRouter()
router.register(r'company-wallet', CompanyWalletViewSet)
router.register(r'bank-accounts', BankAccountViewSet)
router.register(r'projects', ProjectWalletViewSet)
router.register(r'project-items', ProjectItemViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'transfers', TransferViewSet)

urlpatterns = [
    path('', include(router.urls)),
]