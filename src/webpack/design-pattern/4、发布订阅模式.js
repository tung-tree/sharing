/**
 * 中介队列
 */
const events = {
  subs: [],
  listen: function (sub) {
    // 监听收集
    this.subs.push(sub);
  },
  trigger: function (val) {
    // 触发更新
    this.subs.forEach((sub) => sub.update(val));
  }
};

/**
 * 发布者
 */
class Publicsher {
  constructor() {
    this.state = 0;
  }
  setState(val) {
    this.state = val;
    events.trigger(val);
  }
}

/**
 * 订阅者
 */
class Subscriber {
  constructor(name) {
    this.name = name;
  }
  update(val) {
    console.log(`我已经变更成：${val}`);
    // 根据传过来的新值，做相应的变化
    // todo something
  }
}

var pub = new Publicsher();

var sub = new Subscriber('小明');

/**
 * 添加 events 到中
 */
events.listen(sub);

let i = 0;

setInterval(() => {
  i++;
  pub.setState(i);
}, 1000);
