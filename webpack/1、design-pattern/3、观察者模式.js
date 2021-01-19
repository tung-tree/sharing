/**
 * 被观察者
 */
class Subject {
  constructor() {
    this.state = 0;
    this.observerList = [];
  }
  setState(value) {
    // value 有更新
    this.state = value;
    // 通知观察者
    this.notify();
  }
  addObserver(observer) {
    // 被观察者 收集 观察者
    this.observerList.push(observer);
  }
  notify() {
    this.observerList.forEach((observer) => {
      // 观察者更新
      observer.update(this.state);
    });
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  update(value) {
    console.log(`我已经变更成：${value}`);
    // 根据传过来的新值，做相应的变化
    // todo something
  }
}

// 实例化被观察者
const sub = new Subject();

// 实例化观察者
const obs1 = new Observer('张三');
sub.addObserver(obs1);

// const obs2 = new Observer('李四');
// sub.addObserver(obs2);

let i = 0;
setInterval(() => {
  i++;
  sub.setState(i);
}, 1000);
