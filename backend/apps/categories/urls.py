from django.urls import path
from .views import CategoryListView, CategoryDetailView, SubcategoryListView

urlpatterns = [
    path('', CategoryListView.as_view(), name='category_list'),
    path('<slug:slug>/', CategoryDetailView.as_view(), name='category_detail'),
    path('<slug:parent_slug>/subcategories/', SubcategoryListView.as_view(), name='subcategory_list'),
]
