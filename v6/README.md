#### 内容
1、实现事件绑定
2、实现更新Props (diff)

3、更新、创建、删除 节点
1) type不一致，删除旧的，创建新的
2) 新的比老的短，多出来的节点需要删除

4、如何只更新当前组件及child组件
* react不是每次都是更新整颗树，而是更新本次渲染setState的组件及其child
* reconcile整颗树，然后轮到处理兄弟节点的时候，不处理兄弟节点，并且结束统一提交


