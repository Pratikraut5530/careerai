from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, UserProfile, Skill, Company, Location, EducationLevel,
    EmploymentType, DesiredWorkEnvironment, JobRole
)

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'is_profile_completed')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional Info', {'fields': ('is_profile_completed',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    ordering = ('email',)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'employment_status', 'preferred_employment_type', 'is_actively_job_searching')
    search_fields = ('user__email', 'user__username', 'location__name')
    list_filter = ('employment_status', 'is_actively_job_searching')


class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class LocationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class EducationLevelAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class EmploymentTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Skill, SkillAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(EducationLevel, EducationLevelAdmin)
admin.site.register(EmploymentType, EmploymentTypeAdmin)
admin.site.register(DesiredWorkEnvironment)
admin.site.register(JobRole)