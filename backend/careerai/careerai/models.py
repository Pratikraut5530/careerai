import mongoengine as me

class Student(me.Document):
    name = me.StringField(required=True, max_length=255)
    email_id = me.EmailField(required=True, unique=True)
    college_name = me.StringField(required=True, max_length=255)
    age = me.IntField()
    year = me.StringField(max_length=50)
    list_of_interests = me.ListField(me.StringField())
    list_of_companies = me.ListField(me.StringField())
    