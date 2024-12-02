from django.conf.urls import url
from app_cichild_database import views

urlpatterns = [

    url(r'^various', views.various, name='various'),
    url(r'^load_data', views.load_data, name='load_data'),
    url(r'^load_actions_log', views.load_actions_log, name='load_actions_log'),
    url(r'^create_new_fish', views.create_new_fish, name='create_new_fish'),
    url(r'^update_fish', views.update_fish, name='update_fish'),
    url(r'^update_clutch', views.update_clutch, name='update_clutch'),
    url(r'^delete_clutch', views.delete_clutch, name='delete_clutch'),
    url(r'^delete_fish', views.delete_fish, name='delete_fish'),
    url(r'^save_new_comment', views.save_new_comment, name='save_new_comment'),
    url(r'^create_new_clutch', views.create_new_clutch, name='create_new_clutch'),
    url(r'^update_comment', views.update_comment, name='update_comment'),
    url(r'^delete_comment', views.delete_comment, name='delete_comment'),
    url(r'^split_tank_fragment', views.split_tank_fragment, name='split_tank_fragment'),
    url(r'^merge_tank_fragment', views.merge_tank_fragments, name='merge_tank_fragment'),
    url(r'^move_fish', views.move_fish, name='move_fish'),
    url(r'^change_fragment_specie', views.change_fragment_specie, name='change_fragment_specie'),
    url(r'^user_login/$', views.user_login, name='user_login'),
    url(r'^download_free_names/$', views.download_free_names, name='download_free_names'),
    url(r'^export_clutches/$', views.export_clutches, name='export_clutches'),
    url(r'^create_new_name_character/$', views.create_new_name_character, name='create_new_name_character'),
]
