<a href="https://github.com/TencentCloudBase/cloudbase-templates"><img src="https://main.qcloudimg.com/raw/d94d993269048beb4827b2612ed53692.png"></a>

# 云开发在线视频会议演示应用
在线视频会议应用是基于浏览器的能力 WebRTC 以及 腾讯云开发 相关能力构建而成的应用. 在云开发的助力下, 一个看似复杂的应用, 一个人一两天即可完成.

应用体验地址: [Online Meeting Powered by Tencent Cloudbase](https://tcb-demo-10cf5b-1302484483.tcloudbaseapp.com/meeting-simple/) 
> 注: 应用仅供演示之用, 目前仅支持两人视频会议, 功能还不够完善, 还有许多可完善之处.   
> 创建会议后可将会议地址发给他人, 或者在本机另起一浏览器窗口(未避免数据混乱, 可开隐私模式窗口, 或使用另一个浏览器)打开会议地址 来体验

本应用用到的能力、工具、框架有:
1. **[CloudBase Framework](https://github.com/TencentCloudBase/cloudbase-framework)** 用于项目基础目录结构生成, 一键部署
2. [Simple Peer](https://github.com/feross/simple-peer) 流行的 WebRTC 库
3. [云开发-云函数](https://docs.cloudbase.net/cloud-function/introduce.html), 包括云函数的定时调用
4. [云开发-数据库](https://docs.cloudbase.net/database/introduce.html)
5. [云开发-静态网站托管](https://docs.cloudbase.net/hosting/introduce.html)
6. [React](https://reactjs.bootcss.com/) 
7. [Ant design](https://ant.design)

如果你不清楚项目开发的基本命令, 可阅读本项目使用的[模版的readme.md](https://github.com/TencentCloudBase/cloudbase-templates/blob/master/react-starter/README.md)


整个应用的构建, 从项目初始化到最终可以一键部署, 共分为六个部分. 未方便读者查阅, 我也分了六次提交, 下述说明中会列出每一步对应的提交commit.

## 第一步 [git commit](https://github.com/oe/serverless-zoom-with-webrtc/commit/a485865738b6ebbf668a49d0dd7876f7cd6ef17f)

1. 初始化项目结构, 使用命令 `cloudbase init --template react-starter` 使用react 模版创建一个项目
2. 引入UI库 ant-design
3. 增加 landing 页, 用于检测 WebRTC 能力以及判断用户是否授予摄像头及麦克风访问权限
4. 增加 Video-window 页, 用于支持视频画面显示

注意要点:
1. 使用 `cloudbase init` 前, 请确保已使用 `npm install -g @cloudbase/cli` [全局安装该命令](https://docs.cloudbase.net/quick-start/web.html)
2. WebRTC 需要浏览器支持, 只有现代浏览器才支持, 建议使用 [Chrome](https://www.google.cn/chrome/)、Firefox 来体验, 具体兼容性可查看 [caniuse](https://caniuse.com/#search=webrtc)
3. 由于安全策略限制, WebRTC 支持 https 协议网站; 其为方便本地开发, 页支持 http 的 `localhost` 及 `127.0.0.1` (不限端口), 不支持其他自定义的本机域名、IP
4. WebRTC 并不具备穿透内网功能, 测试体验时, 确保双方机器都处于公网之中并能访问[云开发](https://www.cloudbase.net)相关域名


## 第二步 [git commit](https://github.com/oe/serverless-zoom-with-webrtc/commit/ecc61be1ba59f7910ebcffe425e0c53edf0160b5)

1. 增加 「创建会议」界面
2. 增加云开发能力调用模块 「api.js」, 添加 创建会议方法(通过云开发js sdk 连接数据库创建记录)
3. 使用JS sdk调用云开发能力时, 需保证调用的域名已加入云开发[WEB安全域名](https://console.cloud.tencent.com/tcb/env/safety)中, 以避免调用时出现跨域问题. 即本地开发使用的域名应增加进 WEB安全域名 中.

注意要点:
1. 浏览器端调用云开发能力需要借助官方npm包 [tcb-js-sdk](https://www.npmjs.com/package/tcb-js-sdk), [官方文档](https://docs.cloudbase.net/api-reference/webv2/initialization.html)
2. 使用云开发能力(不论是在浏览器端、Node端或其他端)调用数据库时, 操作端collection必须存在, 否则会报错. 所以在本步骤应当提前进入[云开发数据库控制台](https://console.cloud.tencent.com/tcb/db/index) 创建视频会议使用的 collection `meeting-simple`


## 第三步 [git commit](https://github.com/oe/serverless-zoom-with-webrtc/commit/c8d9edcfc193e152ea5f3422aa4621c98399f819)

1. 增加 「加入会议」界面
2. 在 「api.js」中增加方法(直接调用云开发数据库能力)获取会议信息、加入会议

注:
1. 数据库需要设置成公开访问, 否则匿名用户无法查询到相关信息: 进入数据库找到对应 collection [https://console.cloud.tencent.com/tcb/database/collection/meeting-simple], 切换至 「权限设置」, 选择 「所有用户可读，仅创建者及管理员可写」并保存


## 第四步 [git commit](https://github.com/oe/serverless-zoom-with-webrtc/commit/607512a28d697e6c2d60efe795d449a483fe40b8)

会议功能已基本可用

1. 增加 simple-peer 来管理 WebRTC 客户端
2. 增加云函数 「更新 ticket」(用于更新WebRTC客户端的连接信息)并手动部署云函数, 增加对会议记录对监听(即使用数据库的实时推送能力)
3. 优化会议信息的获取提升体验

注意:
1. 云函数手动更新需使用命令行 `tcb functions:deploy [函数名称] -e [环境ID]`, 具体可[参考文档](https://docs.cloudbase.net/cloud-function/quick-start.html#di-2-bu-fa-bu-yun-han-shu)
2. 监听数据库变化亦需要将数据库设置为公开访问, 即上述第三步中的注意事项 2 所述
3. 匿名用户无法修改其他匿名用户创建的记录. 根据数据库安全策略, 虽同为匿名用户, 但不同客户端的匿名用户标志不一样, 故不能操作他人的记录. 而云函数有用管理员级别的数据库操作权限, 故 「更新 ticket」功能采用了云函数来编写


## 第五步 [git commit](https://github.com/oe/serverless-zoom-with-webrtc/commit/1cd2ebff769d06b29a34b245984d8fc61df17444)

提升非公开会议访问的安全性, 优化数据库使用
1. 将会议密码分表存储
2. 数据库collection定期清理旧的无用记录

注意:
1. 会议密码使用了collection `meeting-simple-pass`, 在使用时需要提前创建
2. 定期清理数据库使用了云函数的[定时触发器](https://docs.cloudbase.net/cloud-function/timer-trigger.html)

## 第六步 [git commit](https://github.com/oe/serverless-zoom-with-webrtc/commit/ec4c008e187b4b93d98fb351ffce2cd64e4c447d)

增加cloudbase framework 一键部署

1. 增加静态部署功能, 使用了 [website 插件](https://github.com/TencentCloudBase/cloudbase-framework/tree/master/packages/framework-plugin-website)
2. 增加部署云函数功能, 包括云函数定时调用的设置, 使用了[function 插件](https://github.com/TencentCloudBase/cloudbase-framework/blob/master/packages/framework-plugin-function/README.md)
3. 增加数据 collection 的创建, 包括 collection 访问权限的设置, 使用了 [database 插件](https://github.com/TencentCloudBase/cloudbase-framework/blob/master/packages/framework-plugin-database/README.md)


更多cloudbase framework插件可阅读[官方文档](https://github.com/TencentCloudBase/cloudbase-framework#%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%E7%9A%84%E6%8F%92%E4%BB%B6%E5%88%97%E8%A1%A8)
