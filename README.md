# mini-react
react的mini实现

#### react把树转换为链表的顺序处理
1. child 孩子
2. sibling 兄弟
3. 叔叔
![树转换为链表](./img/树转换为链表.png)

* 方案
1、树转换为链表之后，再执行任务
2、一遍转换，一遍执行任务。(例如：先遍历a的child节点，执行b,c这两个任务，执行完了再执行a;然后再执行b的child,c的child)

#### react的diff
* 通过在render过程中创建的alternate备用dom节点实现
* 右侧树是新树，左侧是旧的树； 右树.alternate指向左树
![alternate](./img/alternate.png)

* 然后在树转换为链表之后，再进行diff对比
![链表diff](./img/链表diff.png)

