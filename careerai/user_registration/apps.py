from django.apps import AppConfig

class UserRegistrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_registration'
    verbose_name = 'User Registration & Management'

    def ready(self):
        # Import signal handlers
        import user_registration.signals