#!/usr/bin/env python3
"""
STUDIO LX 压力测试脚本
- 100 个并发用户
- 模拟注册、登录、浏览、下单、随机操作
"""
import random
import string
from locust import HttpUser, TaskSet, task, between

BASE_URL = "http://localhost:3000"

class UserBehavior(TaskSet):
    def on_start(self):
        """每个虚拟用户开始时的初始化"""
        # 生成唯一测试邮箱
        self.email = f"load-test-{random.randint(100000,999999)}@studiolx.com"
        self.password = "TestPass123!"
        self.product_slug = None
        self.register()
        self.login()

    def register(self):
        """注册账号"""
        response = self.client.post(
            "/api/auth/register",
            json={
                "email": self.email,
                "password": self.password,
                "confirmPassword": self.password,
            },
            name="Register",
        )

    def login(self):
        """登录"""
        form_data = {
            "email": self.email,
            "password": self.password,
        }
        self.client.post("/admin/login", data=form_data, name="Login")

    @task(5)
    def browse_home(self):
        """浏览首页"""
        self.client.get("/", name="Browse Home")

    @task(3)
    def browse_category(self):
        """浏览分类（随机选择）"""
        categories = ["women", "men", "new-arrival", "best-seller"]
        category = random.choice(categories)
        self.client.get(f"/{category}", name=f"Browse {category}")

    @task(3)
    def search_products(self):
        """搜索商品"""
        keywords = ["dress", "shirt", "bag", "shoe", "coat"]
        keyword = random.choice(keywords)
        self.client.get(f"/search?q={keyword}", name="Search products")

    @task(2)
    def view_product(self):
        """查看商品详情"""
        # 这里用一个固定的测试商品，实际应该从列表中动态获取
        self.client.get("/product/email-test-product-sample", name="View product")

    @task(1)
    def add_to_cart(self):
        """加购物车（通过客户端本地存储模拟）"""
        # Locust 可以访问页面，购物车是客户端存储
        self.client.get("/cart", name="View cart")

    @task(1)
    def checkout_flow(self):
        """结账流程（只访问结账页，不真正提交）"""
        self.client.get("/checkout", name="Checkout page")

    @task(1)
    def browse_info_pages(self):
        """浏览信息页（隐私政策、服务条款等）"""
        pages = ["/privacy", "/terms", "/about", "/faq"]
        page = random.choice(pages)
        self.client.get(page, name=f"Browse {page}")


class StudioLXUser(HttpUser):
    """STUDIO LX 用户行为模型"""
    tasks = [UserBehavior]
    # 每个用户在两个任务之间等待 1-3 秒
    wait_time = between(1, 3)
