#!/usr/bin/env python3
"""
STUDIO LX 压力测试脚本 v2
- 500 个并发用户
- 模拟登录、浏览、搜索、下单前流程
- 用预建的测试账号（无需注册，绕过 Server Action 限制）
"""
import random
from locust import HttpUser, TaskSet, task, between

BASE_URL = "http://localhost:3000"
TEST_EMAIL = "load-test-base@studiolx.com"
TEST_PASSWORD = "TestPass123!"

class UserBehavior(TaskSet):
    def on_start(self):
        """每个虚拟用户开始时的初始化"""
        self.login()

    def login(self):
        """登录（所有用户共用一个测试账号）"""
        form_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        }
        self.client.post("/admin/login", data=form_data, name="Login")

    @task(8)
    def browse_home(self):
        """浏览首页"""
        self.client.get("/", name="Browse Home")

    @task(5)
    def browse_category(self):
        """浏览分类（随机选择）"""
        categories = ["women", "men", "new-arrival", "best-seller"]
        category = random.choice(categories)
        self.client.get(f"/{category}", name=f"Browse {category}")

    @task(4)
    def search_products(self):
        """搜索商品"""
        keywords = ["dress", "shirt", "bag", "shoe", "coat"]
        keyword = random.choice(keywords)
        self.client.get(f"/search?q={keyword}", name="Search products")

    @task(3)
    def view_product(self):
        """查看商品详情"""
        self.client.get("/product/email-test-product-sample", name="View product")

    @task(2)
    def view_cart(self):
        """查看购物车"""
        self.client.get("/cart", name="View cart")

    @task(1)
    def checkout_page(self):
        """访问结账页"""
        self.client.get("/checkout", name="Checkout page")

    @task(1)
    def browse_info_pages(self):
        """浏览信息页"""
        pages = ["/privacy", "/terms", "/about", "/faq"]
        page = random.choice(pages)
        self.client.get(page, name=f"Browse {page}")


class StudioLXUser(HttpUser):
    """STUDIO LX 用户行为模型"""
    tasks = [UserBehavior]
    # 每个用户在两个任务之间等待 1-3 秒
    wait_time = between(1, 3)
