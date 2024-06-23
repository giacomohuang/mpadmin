import Mock from 'mockjs'
import { customAlphabet } from 'nanoid'

Mock.setup({
  // timeout: '10-100'
})

const baseUrl = '/api'
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 8)
// const Random = Mock.Random
const userPermission = {
  p1: '18014398509481983',
  p16: '9187343239835811840',
  p17: '9223372036854775807',
  p18: '9223372036854775807',
  p19: '9223372036854775807'
}
const permissionData = [
  { groupId: 1, id: 1, name: '用户信息查看' },
  { groupId: 1, id: 2, name: '产品添加' },
  { groupId: 1, id: 3, name: '订单审核' },
  { groupId: 1, id: 4, name: '员工考勤' },
  { groupId: 1, id: 5, name: '库存盘点' },
  { groupId: 1, id: 6, name: '论坛发言' },
  { groupId: 1, id: 7, name: '文章发布' },
  { groupId: 1, id: 8, name: '活动策划' },
  { groupId: 1, id: 9, name: '资源下载' },
  { groupId: 1, id: 10, name: '数据分析' },
  { groupId: 1, id: 11, name: '店铺管理' },
  { groupId: 1, id: 12, name: '广告投放' },
  { groupId: 1, id: 13, name: '客户反馈' },
  { groupId: 1, id: 14, name: '绩效评估' },
  { groupId: 1, id: 15, name: '预算编制' },
  { groupId: 1, id: 16, name: '邮件列表管理' },
  { groupId: 1, id: 17, name: '职位调整' },
  { groupId: 1, id: 18, name: '礼品发放' },
  { groupId: 1, id: 19, name: '合同签订' },
  { groupId: 1, id: 20, name: '视频上传' },
  { groupId: 1, id: 21, name: '软件安装' },
  { groupId: 1, id: 22, name: '数据备份' },
  { groupId: 1, id: 23, name: '图表制作' },
  { groupId: 1, id: 24, name: '物流跟踪' },
  { groupId: 1, id: 25, name: '任务分配' },
  { groupId: 1, id: 26, name: '投票设置' },
  { groupId: 1, id: 27, name: '优惠券管理' },
  { groupId: 1, id: 28, name: '网站维护' },
  { groupId: 1, id: 29, name: '安全检测' },
  { groupId: 1, id: 30, name: '移动设备管理' },
  { groupId: 1, id: 31, name: '财务报表' },
  { groupId: 1, id: 32, name: '合作伙伴管理' },
  { groupId: 1, id: 33, name: '客服支持' },
  { groupId: 1, id: 34, name: '知识分享' },
  { groupId: 1, id: 35, name: '设备租赁' },
  { groupId: 1, id: 36, name: '工作流管理' },
  { groupId: 1, id: 37, name: '营销活动' },
  { groupId: 1, id: 38, name: '礼品定制' },
  { groupId: 1, id: 39, name: '品牌推广' },
  { groupId: 1, id: 40, name: '培训课程' },
  { groupId: 1, id: 41, name: '数据清洗' },
  { groupId: 1, id: 42, name: '系统监控' },
  { groupId: 1, id: 43, name: '隐私设置' },
  { groupId: 1, id: 44, name: '餐饮管理' },
  { groupId: 1, id: 45, name: '员工培训' },
  { groupId: 1, id: 46, name: '项目预算' },
  { groupId: 1, id: 47, name: '文档加密' },
  { groupId: 1, id: 48, name: '数据迁移' },
  { groupId: 1, id: 49, name: '服务开通' },
  { groupId: 1, id: 50, name: '会员管理' },
  { groupId: 1, id: 51, name: '场地布置' },
  { groupId: 1, id: 52, name: '媒体资源' },
  { groupId: 1, id: 53, name: '健康档案' },
  { groupId: 1, id: 54, name: '车辆管理' },
  { groupId: 2, id: 1001, name: '订单查询' },
  { groupId: 2, id: 1002, name: '商品管理' },
  { groupId: 2, id: 1003, name: '库存调拨' },
  { groupId: 2, id: 1004, name: '采购管理' },
  { groupId: 2, id: 1005, name: '销售分析' },
  { groupId: 2, id: 1006, name: '财务管理' },
  { groupId: 2, id: 1007, name: '报表统计' },
  { groupId: 2, id: 1008, name: '系统设置' },
  { groupId: 2, id: 1009, name: '权限管理' },
  { groupId: 2, id: 1010, name: '用户管理' },
  { groupId: 2, id: 1011, name: '角色管理' },
  { groupId: 2, id: 1012, name: '组织架构' },
  { groupId: 2, id: 1013, name: '合同管理' },
  { groupId: 2, id: 1014, name: '项目管理' },
  { groupId: 2, id: 1015, name: '任务管理' },
  { groupId: 2, id: 1016, name: '流程管理' },
  { groupId: 2, id: 1017, name: '审批管理' },
  { groupId: 2, id: 1018, name: '通知管理' },
  { groupId: 2, id: 1019, name: '消息管理' },
  { groupId: 2, id: 1020, name: '日志管理' },
  { groupId: 2, id: 1021, name: '数据字典' },
  { groupId: 2, id: 1022, name: '代码生成' },
  { groupId: 2, id: 1023, name: '定时任务' },
  { groupId: 2, id: 1024, name: '文件管理' },
  { groupId: 2, id: 1025, name: '邮件管理' },
  { groupId: 2, id: 1026, name: '短信管理' },
  { groupId: 2, id: 1027, name: '日程安排' },
  { groupId: 2, id: 1028, name: '会议管理' },
  { groupId: 2, id: 1029, name: '通讯录' },
  { groupId: 2, id: 1030, name: '知识库' },
  { groupId: 2, id: 1031, name: '问题反馈' },
  { groupId: 2, id: 1032, name: '在线客服' },
  { groupId: 2, id: 1033, name: '投诉建议' },
  { groupId: 2, id: 1034, name: '问卷调查' },
  { groupId: 2, id: 1035, name: '活动管理' },
  { groupId: 2, id: 1036, name: '营销推广' },
  { groupId: 2, id: 1037, name: '广告投放' },
  { groupId: 2, id: 1038, name: '会员等级' },
  { groupId: 2, id: 1039, name: '积分管理' },
  { groupId: 2, id: 1040, name: '优惠券管理' },
  { groupId: 2, id: 1041, name: '礼品卡管理' },
  { groupId: 2, id: 1042, name: '订单退款' },
  { groupId: 2, id: 1043, name: '商品评价' },
  { groupId: 2, id: 1044, name: '交易记录' },
  { groupId: 2, id: 1045, name: '资金管理' },
  { groupId: 2, id: 1046, name: '提现申请' },
  { groupId: 2, id: 1047, name: '充值记录' },
  { groupId: 2, id: 1048, name: '转账记录' },
  { groupId: 2, id: 1049, name: '收款记录' },
  { groupId: 2, id: 1050, name: '账户设置' },
  { groupId: 2, id: 1051, name: '安全设置' },
  { groupId: 2, id: 1052, name: '密码修改' },
  { groupId: 2, id: 1053, name: '密保设置' },
  { groupId: 2, id: 1054, name: '实名认证' },
  { groupId: 2, id: 1055, name: '手机绑定' },
  { groupId: 2, id: 1056, name: '邮箱绑定' },
  { groupId: 2, id: 1057, name: '社交账号绑定' },
  { groupId: 2, id: 1058, name: '消息通知设置' },
  { groupId: 2, id: 1059, name: '隐私设置' },
  { groupId: 2, id: 1060, name: '帮助中心' },
  { groupId: 2, id: 1061, name: '常见问题' },
  { groupId: 2, id: 1062, name: '在线教程' },
  { groupId: 2, id: 1063, name: '操作指南' },
  { groupId: 2, id: 1064, name: '用户协议' },
  { groupId: 2, id: 1065, name: '隐私政策' },
  { groupId: 2, id: 1066, name: '免责声明' },
  { groupId: 2, id: 1067, name: '关于我们' },
  { groupId: 2, id: 1068, name: '联系我们' },
  { groupId: 2, id: 1069, name: '合作伙伴' },
  { groupId: 2, id: 1070, name: '友情链接' },
  { groupId: 2, id: 1071, name: '网站地图' },
  { groupId: 2, id: 1072, name: '搜索引擎优化' },
  { groupId: 2, id: 1073, name: '网站流量分析' },
  { groupId: 2, id: 1074, name: '用户行为分析' },
  { groupId: 2, id: 1075, name: '页面访问统计' },
  { groupId: 2, id: 1076, name: '热门搜索' },
  { groupId: 2, id: 1077, name: '搜索关键词' },
  { groupId: 2, id: 1078, name: '网站内容管理' },
  { groupId: 2, id: 1079, name: '文章发布' },
  { groupId: 2, id: 1080, name: '新闻资讯' },
  { groupId: 2, id: 1081, name: '产品介绍' },
  { groupId: 2, id: 1082, name: '公司动态' },
  { groupId: 2, id: 1083, name: '行业动态' },
  { groupId: 2, id: 1084, name: '媒体报道' },
  { groupId: 2, id: 1085, name: '广告宣传' },
  { groupId: 2, id: 1086, name: '活动公告' },
  { groupId: 2, id: 1087, name: '用户评论' },
  { groupId: 2, id: 1088, name: '用户举报' },
  { groupId: 2, id: 1089, name: '用户反馈' },
  { groupId: 2, id: 1090, name: '用户建议' },
  { groupId: 2, id: 1091, name: '用户投诉' },
  { groupId: 2, id: 1092, name: '用户满意度调查' },
  { groupId: 2, id: 1093, name: '用户忠诚度调查' },
  { groupId: 2, id: 1094, name: '用户画像' },
  { groupId: 2, id: 1095, name: '用户兴趣分析' },
  { groupId: 2, id: 1096, name: '用户行为预测' },
  { groupId: 2, id: 1097, name: '用户流失预警' },
  { groupId: 2, id: 1098, name: '用户价值评估' },
  { groupId: 2, id: 1099, name: '数据挖掘' },
  { groupId: 2, id: 1100, name: '机器学习' },
  { groupId: 2, id: 1101, name: '深度学习' },
  { groupId: 2, id: 1102, name: '人工智能' },
  { groupId: 2, id: 1103, name: '自然语言处理' },
  { groupId: 2, id: 1104, name: '计算机视觉' },
  { groupId: 2, id: 1105, name: '语音识别' },
  { groupId: 2, id: 1106, name: '图像识别' },
  { groupId: 2, id: 1107, name: '数据分析' },
  { groupId: 2, id: 1108, name: '数据可视化' },
  { groupId: 2, id: 1109, name: '数据清洗' },
  { groupId: 2, id: 1110, name: '数据预处理' },
  { groupId: 2, id: 1111, name: '数据标注' },
  { groupId: 2, id: 1112, name: '数据存储' },
  { groupId: 2, id: 1113, name: '数据备份' },
  { groupId: 2, id: 1114, name: '数据恢复' },
  { groupId: 2, id: 1115, name: '数据加密' },
  { groupId: 2, id: 1116, name: '数据压缩' },
  { groupId: 2, id: 1117, name: '数据库管理' },
  { groupId: 2, id: 1118, name: '数据表设计' },
  { groupId: 2, id: 1119, name: '数据查询' },
  { groupId: 2, id: 1120, name: '数据插入' },
  { groupId: 2, id: 1121, name: '数据更新' },
  { groupId: 2, id: 1122, name: '数据删除' },
  { groupId: 2, id: 1123, name: '数据导入' },
  { groupId: 2, id: 1124, name: '数据导出' },
  { groupId: 2, id: 1125, name: '数据迁移' },
  { groupId: 2, id: 1126, name: '数据同步' },
  { groupId: 2, id: 1127, name: '数据共享' },
  { groupId: 2, id: 1128, name: '软件开发' },
  { groupId: 2, id: 1129, name: '软件测试' },
  { groupId: 2, id: 1130, name: '软件维护' },
  { groupId: 2, id: 1131, name: '软件升级' },
  { groupId: 2, id: 1132, name: '软件部署' },
  { groupId: 2, id: 1133, name: '软件定制' },
  { groupId: 2, id: 1134, name: '软件设计' },
  { groupId: 2, id: 1135, name: '软件架构' },
  { groupId: 2, id: 1136, name: '软件需求分析' },
  { groupId: 2, id: 1137, name: '软件项目管理' },
  { groupId: 2, id: 1138, name: '软件文档撰写' },
  { groupId: 2, id: 1139, name: '软件代码编写' },
  { groupId: 2, id: 1140, name: '软件界面设计' },
  { groupId: 2, id: 1141, name: '软件用户体验' },
  { groupId: 2, id: 1142, name: '软件性能优化' },
  { groupId: 2, id: 1143, name: '软件安全加固' },
  { groupId: 2, id: 1144, name: '软件漏洞修复' },
  { groupId: 2, id: 1145, name: '软件质量保证' },
  { groupId: 2, id: 1146, name: '网络安全' },
  { groupId: 2, id: 1147, name: '防火墙' },
  { groupId: 2, id: 1148, name: '入侵检测' },
  { groupId: 2, id: 1149, name: '漏洞扫描' },
  { groupId: 2, id: 1150, name: '病毒防护' },
  { groupId: 2, id: 1151, name: '数据安全' },
  { groupId: 2, id: 1152, name: '访问控制' },
  { groupId: 2, id: 1153, name: '身份验证' },
  { groupId: 2, id: 1154, name: '授权管理' },
  { groupId: 2, id: 1155, name: '数据加密' },
  { groupId: 2, id: 1156, name: '数据备份' },
  { groupId: 2, id: 1157, name: '安全审计' },
  { groupId: 2, id: 1158, name: '应急响应' },
  { groupId: 2, id: 1159, name: '灾难恢复' },
  { groupId: 2, id: 1160, name: '业务连续性计划' },
  { groupId: 2, id: 1161, name: '云计算' },
  { groupId: 2, id: 1162, name: '云存储' },
  { groupId: 2, id: 1163, name: '云数据库' },
  { groupId: 2, id: 1164, name: '云服务器' },
  { groupId: 2, id: 1165, name: '云安全' },
  { groupId: 2, id: 1166, name: '云监控' },
  { groupId: 2, id: 1167, name: '云计费' },
  { groupId: 2, id: 1168, name: '云运维' },
  { groupId: 2, id: 1169, name: '大数据' },
  { groupId: 2, id: 1170, name: '数据采集' },
  { groupId: 2, id: 1171, name: '数据清洗' },
  { groupId: 2, id: 1172, name: '数据分析' },
  { groupId: 2, id: 1173, name: '数据挖掘' },
  { groupId: 2, id: 1174, name: '数据可视化' },
  { groupId: 2, id: 1175, name: '数据仓库' },
  { groupId: 2, id: 1176, name: '数据湖' },
  { groupId: 2, id: 1177, name: '数据治理' },
  { groupId: 2, id: 1178, name: '物联网' },
  { groupId: 2, id: 1179, name: '传感器' },
  { groupId: 2, id: 1180, name: 'RFid' },
  { groupId: 2, id: 1181, name: '智能设备' },
  { groupId: 2, id: 1182, name: '智能家居' },
  { groupId: 2, id: 1183, name: '智能交通' },
  { groupId: 2, id: 1184, name: '智能医疗' },
  { groupId: 2, id: 1185, name: '智能安防' },
  { groupId: 2, id: 1186, name: '区块链' },
  { groupId: 2, id: 1187, name: '比特币' },
  { groupId: 2, id: 1188, name: '以太坊' },
  { groupId: 2, id: 1189, name: '智能合约' },
  { groupId: 2, id: 1190, name: '去中心化应用' },
  { groupId: 2, id: 1191, name: '加密货币' },
  { groupId: 2, id: 1192, name: '数字签名' },
  { groupId: 2, id: 1193, name: '共识机制' },
  { groupId: 2, id: 1194, name: '区块链浏览器' },
  { groupId: 2, id: 1195, name: '移动应用开发' },
  { groupId: 2, id: 1196, name: 'iOS 开发' },
  { groupId: 2, id: 1197, name: 'Android 开发' },
  { groupId: 2, id: 1198, name: '跨平台开发' },
  { groupId: 2, id: 1199, name: '微信小程序开发' },
  { groupId: 2, id: 1200, name: '移动应用测试' },
  { groupId: 2, id: 1201, name: '移动应用维护' },
  { groupId: 2, id: 1202, name: '移动应用推广' },
  { groupId: 2, id: 1203, name: '移动应用运营' },
  { groupId: 2, id: 1204, name: '人工智能应用开发' },
  { groupId: 2, id: 1205, name: '机器学习应用开发' },
  { groupId: 2, id: 1206, name: '深度学习应用开发' },
  { groupId: 2, id: 1207, name: '自然语言处理应用开发' },
  { groupId: 2, id: 1208, name: '计算机视觉应用开发' },
  { groupId: 2, id: 1209, name: '语音识别应用开发' },
  { groupId: 3, id: 1210, name: '图像识别应用开发' },
  { groupId: 3, id: 1211, name: '人工智能算法研究' },
  { groupId: 3, id: 1212, name: '机器学习算法研究' },
  { groupId: 3, id: 1213, name: '深度学习算法研究' },
  { groupId: 3, id: 1214, name: '自然语言处理算法研究' },
  { groupId: 3, id: 1215, name: '计算机视觉算法研究' },
  { groupId: 3, id: 1216, name: '语音识别算法研究' },
  { groupId: 3, id: 1217, name: '图像识别算法研究' },
  { groupId: 3, id: 1218, name: '人工智能技术应用' },
  { groupId: 3, id: 1219, name: '机器学习技术应用' },
  { groupId: 3, id: 1220, name: '深度学习技术应用' },
  { groupId: 3, id: 1221, name: '自然语言处理技术应用' },
  { groupId: 3, id: 1222, name: '计算机视觉技术应用' },
  { groupId: 3, id: 1223, name: '语音识别技术应用' },
  { groupId: 3, id: 1224, name: '图像识别技术应用' },
  { groupId: 3, id: 1225, name: '大数据应用开发' },
  { groupId: 3, id: 1226, name: '数据采集与清洗' },
  { groupId: 3, id: 1227, name: '数据分析与挖掘' },
  { groupId: 3, id: 1228, name: '数据可视化与呈现' },
  { groupId: 3, id: 1229, name: '大数据平台搭建' },
  { groupId: 3, id: 1230, name: '大数据存储与管理' },
  { groupId: 3, id: 1231, name: '大数据计算与处理' },
  { groupId: 3, id: 1232, name: '大数据安全与隐私' },
  { groupId: 3, id: 1233, name: '云计算应用开发' },
  { groupId: 3, id: 1234, name: '云存储与管理' },
  { groupId: 3, id: 1235, name: '云数据库与管理' },
  { groupId: 3, id: 1236, name: '云服务器与管理' },
  { groupId: 3, id: 1237, name: '云安全与防护' },
  { groupId: 3, id: 1238, name: '云监控与运维' },
  { groupId: 3, id: 1239, name: '云计费与结算' },
  { groupId: 3, id: 1240, name: '物联网应用开发' },
  { groupId: 3, id: 1241, name: '传感器与设备' },
  { groupId: 3, id: 1242, name: 'RFid 与标签' },
  { groupId: 3, id: 1243, name: '智能设备与家居' },
  { groupId: 3, id: 1244, name: '智能交通与物流' },
  { groupId: 3, id: 1245, name: '智能医疗与健康' },
  { groupId: 3, id: 1246, name: '智能安防与监控' },
  { groupId: 3, id: 1247, name: '区块链应用开发' },
  { groupId: 3, id: 1248, name: '智能合约与应用' },
  { groupId: 3, id: 1249, name: '去中心化应用开发' },
  { groupId: 3, id: 1250, name: '加密货币与交易' },
  { groupId: 3, id: 1251, name: '数字签名与认证' },
  { groupId: 3, id: 1252, name: '共识机制与算法' },
  { groupId: 3, id: 1253, name: '区块链浏览器与工具' },
  { groupId: 3, id: 1254, name: '移动应用设计' },
  { groupId: 3, id: 1255, name: '用户体验与界面设计' },
  { groupId: 3, id: 1256, name: '交互设计与流程优化' },
  { groupId: 3, id: 1257, name: '移动应用原型设计' },
  { groupId: 3, id: 1258, name: '视觉设计与品牌形象' },
  { groupId: 3, id: 1259, name: '移动应用开发团队管理' },
  { groupId: 3, id: 1260, name: '项目进度与风险管理' },
  { groupId: 3, id: 1261, name: '团队协作与沟通' },
  { groupId: 3, id: 1262, name: '移动应用市场推广' },
  { groupId: 3, id: 1263, name: '应用商店优化与排名' },
  { groupId: 3, id: 1264, name: '社交媒体与口碑营销' },
  { groupId: 3, id: 1265, name: '广告投放与推广活动' },
  { groupId: 3, id: 1266, name: '用户增长与留存策略' },
  { groupId: 3, id: 1267, name: '移动应用运营与数据分析' },
  { groupId: 3, id: 1268, name: '用户行为与数据分析' },
  { groupId: 3, id: 1269, name: '应用性能与用户反馈' },
  { groupId: 3, id: 1270, name: '运营策略与优化调整' },
  { groupId: 3, id: 1271, name: '人工智能产品设计' },
  { groupId: 3, id: 1272, name: '机器学习产品设计' },
  { groupId: 3, id: 1273, name: '深度学习产品设计' },
  { groupId: 3, id: 1274, name: '自然语言处理产品设计' },
  { groupId: 3, id: 1275, name: '计算机视觉产品设计' },
  { groupId: 3, id: 1276, name: '语音识别产品设计' },
  { groupId: 3, id: 1277, name: '图像识别产品设计' },
  { groupId: 3, id: 1278, name: '人工智能项目管理' },
  { groupId: 3, id: 1279, name: '机器学习项目管理' }
]

const approval_data = {
  groupId: [
    {
      id: nanoid(),
      type: 0,
      title: '开始',
      body: '',
      approver: ''
    },
    {
      id: nanoid(),
      type: 7,
      branches: [
        {
          groupId: [
            { id: nanoid(), type: 2, title: '审批', body: '', approver: '' },
            { id: nanoid(), type: 2, title: '审批', body: '', approver: '' }
          ]
        },
        {
          groupId: [{ id: nanoid(), type: 2, title: '审批', body: '', approver: '' }]
        }
      ]
    },
    {
      id: nanoid(),
      type: 5,
      branches: [
        {
          id: nanoid(),
          type: 6,
          title: '条件1',
          priority: 1,
          body: '',
          groupId: [
            { id: nanoid(), type: 2, title: '审批', body: '' },
            {
              id: nanoid(),
              type: 5,
              branches: [
                {
                  id: nanoid(),
                  type: 6,
                  title: '条件A',
                  priority: 1,
                  body: '',
                  groupId: [{ id: nanoid(), type: 2, title: '审批', body: '' }]
                },
                {
                  id: nanoid(),
                  type: 6,
                  title: '条件B',
                  priority: 2,
                  body: '',
                  groupId: [
                    { id: nanoid(), type: 2, title: '审批', body: '' },
                    { id: nanoid(), type: 3, title: '办理', body: '' }
                  ]
                },
                {
                  id: nanoid(),
                  type: 6,
                  title: '默认条件',
                  priority: 3,
                  default: true,
                  body: '',
                  groupId: [{ id: nanoid(), type: 2, title: '审批2', body: '' }]
                }
              ]
            },
            { id: nanoid(), type: 3, title: '办理', body: '' },
            { id: nanoid(), type: 4, title: '抄送', body: '' }
          ]
        },
        {
          id: nanoid(),
          type: 6,
          title: '条件2A',
          priority: 2,
          body: '',
          default: true,
          groupId: [{ id: nanoid(), type: 2, title: '审批2', body: '' }]
        }
      ]
    },
    {
      id: nanoid(),
      type: 1,
      title: '结束',
      body: '',
      approver: '用户a'
    }
  ]
}

const dept_data = [
  {
    dept_id: '1',
    name: '猫猫集团',
    fullname: '猫猫',
    type: 0,
    is_entity: false,
    leader_id: null,
    leader_name: '张三',
    show_orders: 0,
    status: 1,
    children: [
      {
        dept_id: '2',
        name: '销售支持部',
        fullname: '猫猫集团-销售支持部',
        type: 0,
        is_entity: false,
        leader_id: null,
        leader_name: '周二二',
        show_orders: 0,
        status: 1,
        children: [
          {
            dept_id: '100',
            name: '市场部',
            fullname: '猫猫集团-市场部',
            type: 0,
            is_entity: false,
            leader_id: null,
            leader_name: '张四',
            show_orders: 0,
            status: 1,
            children: []
          }
        ]
      },
      {
        dept_id: '3',
        name: '市场部',
        fullname: '猫猫集团-市场部',
        type: 0,
        is_entity: false,
        leader_id: null,
        leader_name: '周二三',
        show_orders: 0,
        status: 1,
        children: []
      },
      {
        dept_id: '4',
        name: '研发中心',
        fullname: '猫猫集团-研发中心',
        type: 0,
        is_entity: false,
        leader_id: null,
        leader_name: '陈伟',
        show_orders: 0,
        status: 1,
        children: [
          {
            dept_id: '5',
            name: '产品部',
            fullname: '猫猫集团-产品部',
            type: 0,
            is_entity: false,
            parent_id: '4',
            leader_id: null,
            leader_name: '周二二',
            show_orders: 0,
            status: 1,
            children: []
          },
          {
            dept_id: '6',
            name: '技术部',
            fullname: '猫猫集团-技术部',
            type: 0,
            is_entity: false,
            leader_id: null,
            leader_name: '黄三',
            show_orders: 0,
            status: 1,
            children: []
          }
        ]
      },
      {
        dept_id: '7',
        name: '区域公司',
        fullname: '猫猫集团-区域公司',
        type: 0,
        is_entity: false,
        leader_id: null,
        leader_name: '黄五',
        show_orders: 0,
        status: 1,
        children: [
          {
            dept_id: '8',
            name: '华东区域',
            fullname: '猫猫集团-华东区域',
            type: 0,
            is_entity: false,
            leader_id: null,
            leader_name: '赵六六',
            show_orders: 0,
            status: 1,
            children: []
          },
          {
            dept_id: '9',
            name: '华东区域',
            fullname: '猫猫集团-华北区域',
            type: 0,
            is_entity: false,
            leader_id: null,
            leader_name: '露琪亚诺',
            show_orders: 0,
            status: 1,
            children: []
          }
        ]
      }
    ]
  }
]
// Mock.mock(RegExp(`${baseUrl}/project/get\\?id=*`), 'get', () => {
//   const data = {
//     ver: '1.0',
//     settings: {},
//     data: [
//       {
//         title: Random.cparagraph(1, 2),
//         id: nanoid(),
//         type: 'MultiChoice',
//         required: true,
//         data: [
//           { name: '<p>123123123<vue-component /></p>', id: nanoid(), fill: { isShow: true, length: 20, type: 'text' } },
//           { name: Random.cparagraph(1, 2), id: nanoid(), fill: { isShow: false } },
//           { name: Random.cparagraph(1, 2), id: nanoid(), fill: { isShow: false } }
//         ]
//       },
//       {
//         title: Random.cparagraph(1, 2),
//         id: nanoid(),
//         type: 'MultiChoice',
//         required: true,
//         data: [
//           { name: Random.cparagraph(1, 2), id: nanoid(), fill: { isShow: false } },
//           { name: Random.cparagraph(1, 2), id: nanoid(), fill: { isShow: false } },
//           { name: Random.cparagraph(1, 2), id: nanoid(), fill: { isShow: false } }
//         ]
//       }
//     ]
//   }
//   return data
// })

Mock.mock(RegExp(`${baseUrl}/approval/get\\?id=*`), 'get', () => {
  return approval_data
})

Mock.mock(RegExp(`${baseUrl}/dept/get\\?id=*`), 'get', () => {
  return dept_data
})

Mock.mock(RegExp(`${baseUrl}/permission/getlist`), 'get', () => {
  return permissionData
})

Mock.mock(RegExp(`${baseUrl}/user/getpermissions\\?uid=*`), 'get', () => {
  return userPermission
})

Mock.mock(RegExp(`${baseUrl}/my/sendcodebyemail`), 'post', () => {
  return { result: true }
})

Mock.mock(RegExp(`${baseUrl}/my/verifycodebyemail.*`), 'post', (options) => {
  console.log('hit mock', options)
  let result = false
  if (JSON.parse(options.body).code == '1234') result = true
  return { result: result }
})
