const el = document.createElement('div');
el.innerText = 'hello';

document.body.append(el);
// document.body.append     和 document.body.appendChild 区别
let i = 0;
while(i<10000){
    i++;
}
