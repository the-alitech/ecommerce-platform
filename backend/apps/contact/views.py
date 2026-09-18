from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from .models import ContactMessage
from .serializers import ContactMessageSerializer


@method_decorator(ratelimit(key='ip', rate='5/h', method='POST'), name='post')
class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        send_mail(
            subject=f'Contact Form: {message.subject}',
            message=f"From: {message.name} ({message.email})\nPhone: {message.phone}\n\n{message.message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_ORDER_EMAIL],
            fail_silently=True,
        )
        return Response({'message': 'Thank you for contacting us. We will get back to you soon.'},
                        status=status.HTTP_201_CREATED)
