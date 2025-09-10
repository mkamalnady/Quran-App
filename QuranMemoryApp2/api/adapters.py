from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        # تعويض الخاصية _has_phone_field إذا غير موجودة لتجنب الخطأ
        if not hasattr(form, '_has_phone_field'):
            form._has_phone_field = False
        return super().save_user(request, user, form, commit)
