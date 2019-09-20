# VSCode插件之字数统计、翻译 

<details>
  <summary>展开查看大纲</summary>
  <pre>
    1 VSCode插件之字数统计、翻译
      1.1 hello world 初体验
      1.2 工作解析点
        1.2.1 激活事件
        1.2.2 主动命令事件
        1.2.3 快捷键事件
      1.3 目标功能：实时字数统计 + 翻译选中文本
        1.3.1 实时字数统计
        1.3.2 翻译选中的文本
        1.3.3 打包、发布
          1.3.3.1 README.md 文件修改问题
          1.3.3.2 无法打包
          1.3.3.3 仓库缺失问题
          1.3.3.4 publish 失败
      1.4 分发与安装
  </pre>
</details>

---

## hello world 初体验

环境条件：
- npm
- git
- 最新版的VS Code（我的是1.32.3，结果测试的时候说我版本太低，就升级到了1.33.0）

根据官网给的链接[your-first-extension](https://code.visualstudio.com/api/get-started/your-first-extension), 我们需要安装一个代码生成工具，减少重复代码的编写。
```
npm install -g yo generator-code
```

万事俱备只欠东风，接下来试试官网的`hello world`,首先是把项目结构搭建出来。
```
yo code
```

根据提示，输入自己想做的插件名称，identifier，描述等信息
```
# ? What type of extension do you want to create? New Extension (TypeScript)
# ? What's the name of your extension? HelloWorld
### Press <Enter> to choose default for all options below ###

# ? What's the identifier of your extension? helloworld
# ? What's the description of your extension? LEAVE BLANK
# ? Enable stricter TypeScript checking in 'tsconfig.json'? Yes
# ? Setup linting using 'tslint'? Yes
# ? Initialize a git repository? Yes
# ? Which package manager to use? npm
```

然后进入到**`./helloworld`** 目录，就可以看到目录结构已经出来了。这种级别的 **demo** 一般都是可以直接跑的。
- 将**`./helloworld`**目录放到VS Code中。
- F5 就会自动进行编译，然后会打开一个**Extension Development Host**窗口
- Command+Shift+P 输入`Hello World`就可以看到效果了。



自带的特效是输出一个“**`Hello World`**” 的**`InformationMessage`**框。具体可以看：
![hello-world-demonstration](/hello-world-demonstration.png)

经过对**Hello World**的练手，环境搭建，项目目录的搭建基本上就熟悉了，然后就可以着手准备本次的插件开发了。

```
cd ../ && rm -rf helloworld/
```


## 工作解析点

拓展本身就是一坨代码，写完了，总的告诉大管家，哪个事件会触发拓展代码的执行，进而来调用刚才写好的代码。


### 激活事件
```
// package.json
"activationEvents": [
    "onCommand:extension.wordCount",
    // 还有其他7个激活事件，可以去查官方文档
	],
```

```
// extension.ts => function active
let disposable = vscode.commands.registerCommand('extension.wordCount', () => {
        const count = wordCounter.updateWordCount();
		if (count){ // && count >= 0) {
            vscode.window.showInformationMessage(`字数：${count}`);
		}
    });
// registerCommand 方法返回一个disposal事件，会被扔到拓展机”总线“去处理
// vscode.d.ts interface ExtensionContext
/**
* An array to which disposables can be added. When this
* extension is deactivated the disposables will be disposed.
*/
subscriptions: { dispose(): any }[];
```

### 主动命令事件
```
// package.json => contributes->commands  即通过Command+Shift+P输入title文案触发的事件
"commands": [
        {
            "command": "extension.wordCount",
            "title": "count Words"
        }
    ],
```

### 快捷键事件
```
// package.json => contributes->keybindings 使用快捷键的方式进行调用，本质上和Command+Shift+P类似
"keybindings": [
        {
            "command": "extension.wordCount",
            "key": "ctrl+shift+,",
            "mac": "ctrl+shift+,"
        }
    ]
```

---


## 目标功能：实时字数统计 + 翻译选中文本

有些东西不适合从零开始，因为太浪费时间了，不如找点现成的，站在别人的肩膀上迭代。

### 实时字数统计
所以我打开**VS Code** 直接在插件市场输入`word count`，结果出来了一堆，然后找了一个看起来还不赖的，[ycjc868-vscode-word-count](https://github.com/ycjcl868/vscode-wordcount), 点进去Repository地址，先看看人家是怎么实现的，感觉可用的关键代码有这么几个：

```
// VSCode 底部状态栏
    private _statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
// 注册光标改变事件
    vscode.window.onDidChangeTextEditorSelection(this.updateWordCount, this, subscriptions);

// 获取当前编辑器对象
    const editor = vscode.window.activeTextEditor;
// 获取文本以及将内容展示到状态栏
    const wordCount = this._getWordCount(doc);
    this._statusBarItem.text = `${wordCount} Words`;
    this._statusBarItem.show();

```

### 翻译选中的文本
功能已经完成一半了，接下来是实现第二个功能**翻译选中文本**，之前写过一个系统级别的翻译的工具，基本原理是：
> 监听系统剪切板的内容变化，
> 调用翻译API完成翻译任务，
> 调用系统GUI组件弹出翻译内容。

能用是能用，就是不太受控制，用的时候开启服务，不用的时候得关掉，要不然疯了一样往外弹提醒。

本次要做一个VS Code中的翻译，这个场景就蛮适合，最起码不会打扰到自己。思路还是看看别人是咋实现类似的功能的。找到了一个**[天气预报](https://juejin.im/post/5b6404d4e51d451905712e55)**的插件，里面有一段代码如下：
```
const config = vscode.workspace.getConfiguration('remind-me') //获取可配置项中的数据
const appkey = config.hefengAppkey? config.hefengAppkey: 'YOUR_KEY' // 这里放和风天气的KEY
WebRequest.get(`https://way.jd.com/he/freeweather?city=${encodeURI(cityName)}&appkey=${appkey}`).
           then(reps => {
               let rep = JSON.parse(reps.body)
               ...... 
           )
```

我不会**TypeScript**，所以使用**WebRequest**的时候，提示我没有这个类，猜想是需要引入这种脚手架的库，然后搜了一下，找到一个**[Web-Request的使用介绍](https://www.npmjs.com/package/web-request)**。

```
npm install web-request
```

然后在**`extension.ts`**中像引入`vscode`一样引用一下。
```
import * as vscode from 'vscode';
import * as WebRequest from 'web-request';
```
有道翻译的API不让免费用了，那就用[百度的翻译API](https://fanyi.baidu.com/transapi?from=auto&to=auto&query=keyword)（翻译的效果好像也还凑活），锅碗瓢盆都准备好了，现在该淘米了，那就得拿到**选中的文本**，代码如下：
```
let selection = editor.selection
let text = editor.document.getText(selection)
```
经过测试发现，代码是间歇性正常，然后我使用**`console.log`** 打印了下web请求的结果，发现是返回内容解析出错了，猜想是汉字在URL中有编解码的影响，然后会导致出问题。就拿`encodeURI`对选中的文本加了下处理。
```
public _translate(keyword: string): string {
    // 获取选中的文本
    let wcconfig = vscode.workspace.getConfiguration("wordcount");
    let url = wcconfig.transapi ? wcconfig.transapi : "https://fanyi.baidu.com/transapi?from=auto&to=auto&query="
    if(keyword) {
        url = url + encodeURI(keyword)
        WebRequest.get(url).then(resp => {
            let rep = JSON.parse(resp.content);
            console.log(resp.content);
            let transret = rep.data[0].dst;
            this._statusBarItem.text = "[" + keyword + "]:" + transret;
            this._statusBarItem.show();
        });
    }
    return "失败了~~~~(>_<)~~~~"
}
```

这样就可以正常工作了，但是看到刚才的那个作者的`repository`中有对于配置文件的使用，为了减少硬编码，咱也试试呗。在**`package.json`**中加入下面的配置项。
```
"commands": [
    {
        "command": "extension.wordCount",
        "title": "count Words"
    }
],
"configuration":{
    "type": "object",
    "title": "some configuration for translate",
    "properties": {
        "wordcount.transapi": {
            "type": "string",
            "default": "https://fanyi.baidu.com/transapi?from=auto&to=auto&query=",
            "description": "auto translate api from baidu"
        }
    }
},
```
拓展代码使用`let wcconfig = vscode.workspace.getConfiguration("wordcount");`就可以拿到对应的配置值了。

### 打包、发布
东西做出来，肯定得分享，不然不会有进步的。然后还是看看别人怎么弄的，跟着做就好了。找到了一个[VSCode插件开发全攻略（十）打包、发布、升级](https://www.cnblogs.com/liuxianan/p/vscode-plugin-publish.html) 真的是详细。

这里我说下我遇到的几个问题。

#### **`README.md`** 文件修改问题
```
➜  wordcount git:(master) ✗ vsce package
Executing prepublish script 'npm run vscode:prepublish'...

> wordcount@0.0.1 vscode:prepublish /Users/biao/Code/vscode/wordcount
> npm run compile


> wordcount@0.0.1 compile /Users/biao/Code/vscode/wordcount
> tsc -p ./

 ERROR  Make sure to edit the README.md file before you publish your extension.
```

解决方法：删掉开头自动生成的文本，写点自己的内容就好了。

#### 无法打包
```
➜  wordcount git:(master) ✗ vsce package
 ERROR  Missing publisher name. Learn more: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions
```
解决思路：[missing publisher name](https://github.com/Microsoft/vscode-vsce/issues/86) 在**package.json** 中加入**publisher**信息就好了。

#### 仓库缺失问题
```
➜  wordcount git:(master) ✗ vsce package
Executing prepublish script 'npm run vscode:prepublish'...

> wordcount@0.0.1 vscode:prepublish /Users/biao/Code/vscode/wordcount
> npm run compile


> wordcount@0.0.1 compile /Users/biao/Code/vscode/wordcount
> tsc -p ./

 WARNING  A 'repository' field is missing from the 'package.json' manifest file.
Do you want to continue? [y/N] n
```
可以看出这里是**Warning**，所以没有也没关系。如果想上传到**GitHub**上，开头环境中的**git**就派上了用场。
```
git add .
git commit -m 'xxxxxx'
git remote add origin your-git-repository
git push origin master
```

#### **publish** 失败
```
➜  wordcount git:(master) ✗ vsce puhlish
Usage: vsce [options] [command]

Options:
  -V, --version                        output the version number
  -h, --help                           output usage information

Commands:
  ls [options]                         Lists all the files that will be published
  package [options]                    Packages an extension
  publish [options] [<version>]        Publishes an extension
  unpublish [options] [<extensionid>]  Unpublishes an extension. Example extension id: microsoft.csharp.
  list <publisher>                     Lists all extensions published by the given publisher
  ls-publishers                        List all known publishers
  create-publisher <publisher>         Creates a new publisher
  delete-publisher <publisher>         Deletes a publisher
  login <publisher>                    Add a publisher to the known publishers list
  logout <publisher>                   Remove a publisher from the known publishers list
  show [options] <extensionid>         Show extension metadata
  search [options] <text>              search extension gallery
  *
```

跟教程上的不一样，怎么就是不成功。后来想了下发布肯定是要身份信息的，照应刚才的Token信息。所以先将publisher登陆下。

````
➜  wordcount git:(master) ✗ vsce login guoruibiao
Publisher 'guoruibiao' is already known
Do you want to overwrite its PAT? [y/N] y
Personal Access Token for publisher 'guoruibiao': ****************************************************

(node:95091) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
➜  wordcount git:(master) ✗ vsce publish
Executing prepublish script 'npm run vscode:prepublish'...

> wordcount@0.0.1 vscode:prepublish /Users/biao/Code/vscode/wordcount
> npm run compile


> wordcount@0.0.1 compile /Users/biao/Code/vscode/wordcount
> tsc -p ./

This extension consists of 566 separate files. For performance reasons, you should bundle your extension: https://aka.ms/vscode-bundle-extension
Publishing guoruibiao.wordcount@0.0.1...
(node:95103) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
 DONE  Published guoruibiao.wordcount@0.0.1
Your extension will live at https://marketplace.visualstudio.com/items?itemName=guoruibiao.wordcount (might take a few seconds for it to show up).
````

Token 的生成按照刚才的链接跟着做就好了，publish通过后会返回一个地址：
> https://marketplace.visualstudio.com/items?itemName=guoruibiao.wordcount 

大概5分钟后就可以访问了。

## 分发与安装
在**VS Code** 插件市场搜索**`word count`** 找到作者是**guoruibiao**的那个，点击**`install`**,完事。

![word-count-in-plugin-market](/plugin-market.png)


![demonstration](/demonstration.gif)

---
<details>
<summary>延伸内容</summary>
<pre>
  kindle推送客户端，一个将网页收集起来做成PDF，推送到kindle客户端的工具。目前差一个前端:-)
</pre>
</detail>
