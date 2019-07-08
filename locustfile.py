from locust import HttpLocust, TaskSet, task

class UserBehavior(TaskSet):
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        # self.login()
        pass

    def on_stop(self):
        """ on_stop is called when the TaskSet is stopping """
        # self.logout()
        pass

    def login(self):
        self.client.post("/login", {"username":"ellen_key", "password":"education"})

    def logout(self):
        self.client.post("/logout", {"username":"ellen_key", "password":"education"})

    @task(1)
    def cart(self):
        self.client.post('/cart/', {'meal': '{"cart_duck_01_honey":1,"cart_duck_01_tomato":1,"cart_duck_01_lemon":1,"cart_beef_01_honey":1,"cart_beef_01_tomato":1,"cart_beef_01_lemon":1,"cart_salmon_01_honey":1,"cart_salmon_01_tomato":1,"cart_salmon_01_lemon":1,"cart_hotdog_01_honey":1,"cart_hotdog_01_tomato":1,"cart_hotdog_01_lemon":1,"cart_greenTea_01":1,"cart_blackTea_01":1,"cart_fish_01":1,"cart_fries_01":1}',
                                   'money': 1430})

    @task(2)
    def index(self):
        self.client.get("/")

    @task(1)
    def profile(self):
        self.client.get("/cart/payment/2")


class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 500
    max_wait = 900