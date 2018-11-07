from django.shortcuts import render, HttpResponse
from . import models
import requests
from bs4 import BeautifulSoup
from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib import auth


def data(x):
    index_data = {
        'kkxsh': '',
        'kkxqh': '',
        'jxlh': '',
        'jash': '',
        'skxq': '',
        'skjc': '',
        'kch': '',
        'kcm': '',
        'kclb': '',
        'skjs': '',
        'xqname': '',
        'jcname': '',
        'jxlname': '',
        'jasname': '',
        'pageNum': str(x),
        'pageSize': '50'
    }
    return index_data


# Create your views here.
def crawler(request):
    models.NewSchedule.objects.all().delete()
    for i in range(1, 154):
        print(i)
        log_url = 'http://zhjw.scu.edu.cn/student/integratedQuery/course/courseSchdule/courseInfo'
        index_header = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '115',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'selectionBar=1443379; JSESSIONID=bacCcwZWxTXjE7IU6VbAw',
            'DNT': '1',
            'Host': 'zhjw.scu.edu.cn',
            'Origin': 'http://zhjw.scu.edu.cn',
            'Referer': 'http://zhjw.scu.edu.cn/student/integratedQuery/course/courseSchdule/index',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
        session = requests.Session()
        log_html = session.post(url=log_url, headers=index_header, data=data(i)).text
        js = json.loads(log_html).get('list').get('records')
        for x in range(len(js)):
            models.NewSchedule.objects.create(academy=js[x].get('kkxsjc'),
                                              course_number=js[x].get('kch'),
                                              course_name=js[x].get('kcm'),
                                              course_list=js[x].get('kxh'),
                                              credit_hour=js[x].get('xs'),
                                              test_type=js[x].get('kclbmc'),
                                              teacher=js[x].get('skjs'),
                                              course_week=js[x].get('zcsm'),
                                              course_day=js[x].get('skxq'),
                                              course_time=js[x].get('skjc'),
                                              campus=js[x].get('xqm'),
                                              teaching_building=js[x].get('jxlm'),
                                              classroom=js[x].get('jasm'),
                                              course_capacity=js[x].get('bkskrl'),
                                              course_limit=js[x].get('xkxzsm'),
                                              course_start=js[x].get('skjc'),
                                              course_end=js[x].get('cxjc')

                                              )
    return render(request, 'crawler.html')


def register(request):
    if request.method == 'POST':
        account = request.POST['account']
        password = request.POST['password']
        if models.User.objects.filter(user_name=account):
            message = '账号已存在'
            request.session['message'] = message
            return redirect('/login')
        else:
            in_password = make_password(password)
            models.User.objects.create(
                user_name=account, user_password=in_password)
            message = '注册成功'
            request.session['message'] = message
            return redirect('/login')


@csrf_exempt
def choose(request):
    if request.is_ajax():
        status = 1
        result = "succuss"
        test = [{"status": 1}]
        # return HttpResponse(
        #     json.dumps({
        #         "status": status,
        #         "result": result,
        #     }), content_type='application/json')
        return HttpResponse(json.dumps(test), content_type='application/json')
    return render(request, 'choose.html')


def login(request):
    if request.method == 'POST':
        account = request.POST['account']
        password = request.POST['password']
        try:
            user = models.User.objects.get(user_name=account)
            bool_password = check_password(password, user.user_password)
            if bool_password:
                request.session['account'] = user.user_name
                return redirect('/index')
            else:
                message = '密码错误'
                return render(request, 'login.html', {'message': message})
        except:
            message = '账号不存在'
            return render(request, 'login.html', {'message': message})
    if 'message' in request.session:
        message = request.session['message']
        del request.session['message']
        return render(request, 'login.html', {'message': message})
    return render(request, 'login.html')


@csrf_exempt
def index(request):
    if 'account' in request.session:
        if request.is_ajax():
            course_name = request.POST['course_number']
            if models.NewSchedule.objects.filter(course_name__contains=course_name):
                schdules = models.NewSchedule.objects.filter(
                    course_name__contains=course_name)
                datas = []
                for schdule in schdules:
                    dt = {
                        "academy": schdule.academy,
                        "course_number": schdule.course_number,
                        "course_name": schdule.course_name,
                        "course_list": schdule.course_list,
                        "credit_hour": schdule.credit_hour,
                        "test_type": schdule.test_type,
                        "teacher": schdule.teacher,
                        "course_week": schdule.course_week,
                        "course_day": schdule.course_day,
                        "course_time": schdule.course_time,
                        "campus": schdule.campus,
                        "teaching_building": schdule.teaching_building,
                        "classroom": schdule.classroom,
                        "course_capacity": schdule.course_capacity,
                        "course_limit": schdule.course_limit,
                        "course_start": schdule.course_start,
                        "course_end": schdule.course_end
                    }
                    datas.append(dt)
                return HttpResponse(json.dumps(datas), content_type='application/json')
            else:
                message = '该课程不存在'
                return HttpResponse(message)
        return render(request, 'index.html')
    return redirect('/login')


def init(request):
    if 'account' in request.session:
        return redirect('/index')
    return redirect('/login')


def logout(request):
    del request.session['account']
    return redirect('/login')


@csrf_exempt
def save(request):
    user = request.session['account']
    models.UserCourse.objects.filter(user_name=user).delete()
    name = request.POST.getlist('name')
    list = request.POST.getlist('list')
    for i in range(len(name)):
        models.UserCourse.objects.create(
            user_name=user,
            course_name=name[i],
            course_list=list[i]
        )
    return HttpResponse('Haha')


@csrf_exempt
def mylovfnt(request):
    user = request.session['account']
    datas = []
    courses = []
    if models.UserCourse.objects.filter(user_name=user):
        courses = models.UserCourse.objects.filter(user_name=user)
    for course in courses:
        schedule = models.NewSchedule.objects.filter(course_name=course.course_name, course_list=course.course_list)[0]
        dt = {
            "academy": schedule.academy,
            "course_number": schedule.course_number,
            "course_name": schedule.course_name,
            "course_list": schedule.course_list,
            "credit_hour": schedule.credit_hour,
            "test_type": schedule.test_type,
            "teacher": schedule.teacher,
            "course_week": schedule.course_week,
            "course_day": schedule.course_day,
            "course_time": schedule.course_time,
            "campus": schedule.campus,
            "teaching_building": schedule.teaching_building,
            "classroom": schedule.classroom,
            "course_capacity": schedule.course_capacity,
            "course_limit": schedule.course_limit,
            "course_start": schedule.course_start,
            "course_end": schedule.course_end
        }
        datas.append(dt)
    return HttpResponse(json.dumps(datas), content_type='application/json')
