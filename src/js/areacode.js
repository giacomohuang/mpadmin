const areaCode = [
  {
    code: '86',
    'zh-CN': '中国大陆',
    en: 'China'
  },
  {
    code: '852',
    'zh-CN': '中国香港',
    en: 'HongKong'
  },
  {
    code: '853',
    'zh-CN': '中国澳门',
    en: 'Macao'
  },
  {
    code: '886',
    'zh-CN': '中国台湾',
    en: 'Taiwan'
  },
  {
    code: '1',
    'zh-CN': '美国/加拿大',
    en: 'United States / Canada'
  },
  {
    code: '7',
    'zh-CN': '俄罗斯',
    en: 'Russia'
  },
  {
    code: '33',
    'zh-CN': '法国',
    en: 'France'
  },
  {
    code: '39',
    'zh-CN': '意大利',
    en: 'Italy'
  },
  {
    code: '44',
    'zh-CN': '英国',
    en: 'United Kingdom'
  },
  {
    code: '49',
    'zh-CN': '德国',
    en: 'Germany'
  },
  {
    code: '60',
    'zh-CN': '马来西亚',
    en: 'Malaysia'
  },
  {
    code: '61',
    'zh-CN': '澳大利亚',
    en: 'Australia'
  },
  {
    code: '62',
    'zh-CN': '印度尼西亚',
    en: 'Indonesia'
  },
  {
    code: '63',
    'zh-CN': '菲律宾',
    en: 'Philippines'
  },
  {
    code: '64',
    'zh-CN': '新西兰',
    en: 'New Zealand'
  },
  {
    code: '65',
    'zh-CN': '新加坡',
    en: 'Singapore'
  },
  {
    code: '66',
    'zh-CN': '泰国',
    en: 'Thailand'
  },
  {
    code: '81',
    'zh-CN': '日本',
    en: 'Japan'
  },
  {
    code: '82',
    'zh-CN': '韩国',
    en: 'Republic of Korea'
  },
  {
    code: '84',
    'zh-CN': '越南',
    en: 'Viet Nam'
  },
  {
    code: '91',
    'zh-CN': '印度',
    en: 'India'
  },
  {
    code: '855',
    'zh-CN': '柬埔寨',
    en: 'Cambodia'
  },
  {
    code: '355',
    'zh-CN': '阿尔巴尼亚',
    en: 'Albania'
  },
  {
    code: '213',
    'zh-CN': '阿尔及利亚',
    en: 'Algeria'
  },
  {
    code: '93',
    'zh-CN': '阿富汗',
    en: 'Afghanistan'
  },
  {
    code: '54',
    'zh-CN': '阿根廷',
    en: 'Argentina'
  },
  {
    code: '971',
    'zh-CN': '阿联酋',
    en: 'United Arab Emirates'
  },
  {
    code: '297',
    'zh-CN': '阿鲁巴',
    en: 'Aruba'
  },
  {
    code: '968',
    'zh-CN': '阿曼',
    en: 'Oman'
  },
  {
    code: '994',
    'zh-CN': '阿塞拜疆',
    en: 'Azerbaijan'
  },
  {
    code: '247',
    'zh-CN': '阿森松',
    en: 'Ascension'
  },
  {
    code: '20',
    'zh-CN': '埃及',
    en: 'Egypt'
  },
  {
    code: '251',
    'zh-CN': '埃塞俄比亚',
    en: 'Ethiopia'
  },
  {
    code: '353',
    'zh-CN': '爱尔兰',
    en: 'Ireland'
  },
  {
    code: '372',
    'zh-CN': '爱沙尼亚',
    en: 'Estonia'
  },
  {
    code: '376',
    'zh-CN': '安道尔',
    en: 'Andorra'
  },
  {
    code: '244',
    'zh-CN': '安哥拉',
    en: 'Angola'
  },
  {
    code: '1264',
    'zh-CN': '安圭拉',
    en: 'Anguilla'
  },
  {
    code: '1268',
    'zh-CN': '安提瓜和巴布达',
    en: 'Antigua and barbuda'
  },
  {
    code: '43',
    'zh-CN': '奥地利',
    en: 'Austria'
  },
  {
    code: '1246',
    'zh-CN': '巴巴多斯',
    en: 'Barbados'
  },
  {
    code: '675',
    'zh-CN': '巴布亚新几内亚',
    en: 'Papua New Guinea'
  },
  {
    code: '1242',
    'zh-CN': '巴哈马',
    en: 'Bahamas'
  },
  {
    code: '92',
    'zh-CN': '巴基斯坦',
    en: 'Pakistan'
  },
  {
    code: '595',
    'zh-CN': '巴拉圭',
    en: 'Paraguay'
  },
  {
    code: '970',
    'zh-CN': '巴勒斯坦',
    en: 'Palestine'
  },
  {
    code: '973',
    'zh-CN': '巴林',
    en: 'Bahrain'
  },
  {
    code: '507',
    'zh-CN': '巴拿马',
    en: 'Panama'
  },
  {
    code: '55',
    'zh-CN': '巴西',
    en: 'Brazil'
  },
  {
    code: '375',
    'zh-CN': '白俄罗斯',
    en: 'Belarus'
  },
  {
    code: '1441',
    'zh-CN': '百慕大',
    en: 'Bermuda'
  },
  {
    code: '359',
    'zh-CN': '保加利亚',
    en: 'Bulgaria'
  },
  {
    code: '229',
    'zh-CN': '贝宁',
    en: 'Benin'
  },
  {
    code: '32',
    'zh-CN': '比利时',
    en: 'Belgium'
  },
  {
    code: '354',
    'zh-CN': '冰岛',
    en: 'Iceland'
  },
  {
    code: '1787',
    'zh-CN': '波多黎各',
    en: 'Puerto Rico'
  },
  {
    code: '48',
    'zh-CN': '波兰',
    en: 'Poland'
  },
  {
    code: '387',
    'zh-CN': '波斯尼亚和黑塞哥维那',
    en: 'Bosnia and Herzegovina'
  },
  {
    code: '591',
    'zh-CN': '玻利维亚',
    en: 'Bolivia'
  },
  {
    code: '501',
    'zh-CN': '伯利兹',
    en: 'Belize'
  },
  {
    code: '267',
    'zh-CN': '博茨瓦纳',
    en: 'Botswana'
  },
  {
    code: '975',
    'zh-CN': '不丹',
    en: 'Bhutan'
  },
  {
    code: '226',
    'zh-CN': '布基纳法索',
    en: 'Burkina Faso'
  },
  {
    code: '257',
    'zh-CN': '布隆迪',
    en: 'Burundi'
  },
  {
    code: '850',
    'zh-CN': '朝鲜',
    en: 'DPR of Korea'
  },
  {
    code: '240',
    'zh-CN': '赤道几内亚',
    en: 'Equatorial Guinea'
  },
  {
    code: '45',
    'zh-CN': '丹麦',
    en: 'Denmark'
  },
  {
    code: '670',
    'zh-CN': '东帝汶',
    en: 'East Timor'
  },
  {
    code: '684',
    'zh-CN': '东萨摩亚(美)',
    en: 'Samoa Eastern'
  },
  {
    code: '228',
    'zh-CN': '多哥',
    en: 'Togo'
  },
  {
    code: '1809',
    'zh-CN': '多米尼加共和国',
    en: 'Dominican Republic'
  },
  {
    code: '593',
    'zh-CN': '厄瓜多尔',
    en: 'Ecuador'
  },
  {
    code: '291',
    'zh-CN': '厄立特里亚',
    en: 'Eritrea'
  },
  {
    code: '298',
    'zh-CN': '法罗群岛',
    en: 'Faroe Islands'
  },
  {
    code: '689',
    'zh-CN': '法属波利尼西亚',
    en: 'French Polynesia'
  },
  {
    code: '594',
    'zh-CN': '法属圭亚那',
    en: 'French Guiana'
  },
  {
    code: '379',
    'zh-CN': '梵蒂冈',
    en: 'Vatican'
  },
  {
    code: '679',
    'zh-CN': '斐济',
    en: 'Fiji'
  },
  {
    code: '358',
    'zh-CN': '芬兰',
    en: 'Finland'
  },
  {
    code: '238',
    'zh-CN': '佛得角',
    en: 'Cape Verde'
  },
  {
    code: '500',
    'zh-CN': '福克兰群岛',
    en: 'Falkland Islands'
  },
  {
    code: '220',
    'zh-CN': '冈比亚',
    en: 'Gambia'
  },
  {
    code: '242',
    'zh-CN': '刚果共和国',
    en: 'Congo'
  },
  {
    code: '57',
    'zh-CN': '哥伦比亚',
    en: 'Colombia'
  },
  {
    code: '506',
    'zh-CN': '哥斯达黎加',
    en: 'Costa Rica'
  },
  {
    code: '1473',
    'zh-CN': '格林纳达',
    en: 'Grenada'
  },
  {
    code: '299',
    'zh-CN': '格陵兰',
    en: 'Greenland'
  },
  {
    code: '995',
    'zh-CN': '格鲁吉亚',
    en: 'Georgia'
  },
  {
    code: '53',
    'zh-CN': '古巴',
    en: 'Cuba'
  },
  {
    code: '1671',
    'zh-CN': '关岛',
    en: 'Guam'
  },
  {
    code: '592',
    'zh-CN': '圭亚那',
    en: 'Guyana'
  },
  {
    code: '7',
    'zh-CN': '哈萨克斯坦',
    en: 'Kazakhstan'
  },
  {
    code: '509',
    'zh-CN': '海地',
    en: 'Haiti'
  },
  {
    code: '31',
    'zh-CN': '荷兰',
    en: 'Netherlands'
  },
  {
    code: '599',
    'zh-CN': '荷属安第列斯',
    en: 'Netherlands Antilles'
  },
  {
    code: '382',
    'zh-CN': '黑山',
    en: 'Montenegro'
  },
  {
    code: '504',
    'zh-CN': '洪都拉斯',
    en: 'Honduras'
  },
  {
    code: '686',
    'zh-CN': '基里巴斯',
    en: 'Kiribati'
  },
  {
    code: '253',
    'zh-CN': '吉布提',
    en: 'Djibouti'
  },
  {
    code: '996',
    'zh-CN': '吉尔吉斯斯坦',
    en: 'Kirgizstan'
  },
  {
    code: '224',
    'zh-CN': '几内亚',
    en: 'Guinea'
  },
  {
    code: '245',
    'zh-CN': '几内亚比绍',
    en: 'Guinea-bissau'
  },
  {
    code: '233',
    'zh-CN': '加纳',
    en: 'Ghana'
  },
  {
    code: '241',
    'zh-CN': '加蓬',
    en: 'Gabon'
  },
  {
    code: '420',
    'zh-CN': '捷克',
    en: 'Czech'
  },
  {
    code: '263',
    'zh-CN': '津巴布韦',
    en: 'Zimbabwe'
  },
  {
    code: '237',
    'zh-CN': '喀麦隆',
    en: 'Cameroon'
  },
  {
    code: '974',
    'zh-CN': '卡塔尔',
    en: 'Qatar'
  },
  {
    code: '1345',
    'zh-CN': '开曼群岛',
    en: 'Cayman Islands'
  },
  {
    code: '269',
    'zh-CN': '科摩罗',
    en: 'Comoros'
  },
  {
    code: '383',
    'zh-CN': '科索沃',
    en: 'Kosovo'
  },
  {
    code: '225',
    'zh-CN': '科特迪瓦',
    en: 'Coted Ivoire'
  },
  {
    code: '965',
    'zh-CN': '科威特',
    en: 'Kuwait'
  },
  {
    code: '385',
    'zh-CN': '克罗地亚',
    en: 'Croatia'
  },
  {
    code: '254',
    'zh-CN': '肯尼亚',
    en: 'Kenya'
  },
  {
    code: '682',
    'zh-CN': '库克群岛',
    en: 'Cook Islands'
  },
  {
    code: '371',
    'zh-CN': '拉脱维亚',
    en: 'Latvia'
  },
  {
    code: '266',
    'zh-CN': '莱索托',
    en: 'Lesotho'
  },
  {
    code: '856',
    'zh-CN': '老挝',
    en: 'Lao'
  },
  {
    code: '961',
    'zh-CN': '黎巴嫩',
    en: 'Lebanon'
  },
  {
    code: '370',
    'zh-CN': '立陶宛',
    en: 'Lithuania'
  },
  {
    code: '231',
    'zh-CN': '利比里亚',
    en: 'Liberia'
  },
  {
    code: '218',
    'zh-CN': '利比亚',
    en: 'Libya'
  },
  {
    code: '423',
    'zh-CN': '列支敦士登',
    en: 'Liechtenstein'
  },
  {
    code: '262',
    'zh-CN': '留尼汪（法属）',
    en: 'Reunion'
  },
  {
    code: '352',
    'zh-CN': '卢森堡',
    en: 'Luxembourg'
  },
  {
    code: '250',
    'zh-CN': '卢旺达',
    en: 'Rwanda'
  },
  {
    code: '40',
    'zh-CN': '罗马尼亚',
    en: 'Romania'
  },
  {
    code: '261',
    'zh-CN': '马达加斯加',
    en: 'Madagascar'
  },
  {
    code: '960',
    'zh-CN': '马尔代夫',
    en: 'Maldives'
  },
  {
    code: '356',
    'zh-CN': '马耳他',
    en: 'Malta'
  },
  {
    code: '265',
    'zh-CN': '马拉维',
    en: 'Malawi'
  },
  {
    code: '223',
    'zh-CN': '马里',
    en: 'Mali'
  },
  {
    code: '1670',
    'zh-CN': '马里亚那群岛',
    en: 'Mariana Is'
  },
  {
    code: '389',
    'zh-CN': '马其顿共和国',
    en: 'Macedonia'
  },
  {
    code: '692',
    'zh-CN': '马绍尔群岛',
    en: 'Marshall Islands'
  },
  {
    code: '596',
    'zh-CN': '马提尼克',
    en: 'Martinique'
  },
  {
    code: '262',
    'zh-CN': '马约特',
    en: 'Mayotte'
  },
  {
    code: '230',
    'zh-CN': '毛里求斯',
    en: 'Mauritius'
  },
  {
    code: '222',
    'zh-CN': '毛里塔尼亚',
    en: 'Mauritania'
  },
  {
    code: '976',
    'zh-CN': '蒙古',
    en: 'Mongolia'
  },
  {
    code: '1664',
    'zh-CN': '蒙特塞拉特岛',
    en: 'Montserrat Is'
  },
  {
    code: '880',
    'zh-CN': '孟加拉国',
    en: 'Bangladesh'
  },
  {
    code: '51',
    'zh-CN': '秘鲁',
    en: 'Peru'
  },
  {
    code: '691',
    'zh-CN': '密克罗尼西亚',
    en: 'Micronesia'
  },
  {
    code: '95',
    'zh-CN': '缅甸',
    en: 'Myanmar'
  },
  {
    code: '373',
    'zh-CN': '摩尔多瓦',
    en: 'Moldova'
  },
  {
    code: '212',
    'zh-CN': '摩洛哥',
    en: 'Morocco'
  },
  {
    code: '377',
    'zh-CN': '摩纳哥',
    en: 'Monaco'
  },
  {
    code: '258',
    'zh-CN': '莫桑比克',
    en: 'Mozambique'
  },
  {
    code: '52',
    'zh-CN': '墨西哥',
    en: 'Mexico'
  },
  {
    code: '264',
    'zh-CN': '纳米比亚',
    en: 'Namibia'
  },
  {
    code: '27',
    'zh-CN': '南非',
    en: 'South Africa'
  },
  {
    code: '672',
    'zh-CN': '南极',
    en: 'South Pole'
  },
  {
    code: '381',
    'zh-CN': '南斯拉夫',
    en: 'Yugoslavia'
  },
  {
    code: '211',
    'zh-CN': '南苏丹',
    en: 'SOUTH SUDAN'
  },
  {
    code: '674',
    'zh-CN': '瑙鲁',
    en: 'Nauru'
  },
  {
    code: '977',
    'zh-CN': '尼泊尔',
    en: 'Nepal'
  },
  {
    code: '505',
    'zh-CN': '尼加拉瓜',
    en: 'Nicaragua'
  },
  {
    code: '227',
    'zh-CN': '尼日尔',
    en: 'Niger'
  },
  {
    code: '234',
    'zh-CN': '尼日利亚',
    en: 'Nigeria'
  },
  {
    code: '683',
    'zh-CN': '纽埃（新西兰属）',
    en: 'Niue'
  },
  {
    code: '47',
    'zh-CN': '挪威',
    en: 'Norway'
  },
  {
    code: '680',
    'zh-CN': '帕劳群岛',
    en: 'Palau'
  },
  {
    code: '64',
    'zh-CN': '皮特肯群岛',
    en: 'Pitcairn'
  },
  {
    code: '351',
    'zh-CN': '葡萄牙',
    en: 'Portugal'
  },
  {
    code: '46',
    'zh-CN': '瑞典',
    en: 'Sweden'
  },
  {
    code: '41',
    'zh-CN': '瑞士',
    en: 'Switzerland'
  },
  {
    code: '503',
    'zh-CN': '萨尔瓦多',
    en: 'El Salvador'
  },
  {
    code: '381',
    'zh-CN': '塞尔维亚',
    en: 'Serbia'
  },
  {
    code: '232',
    'zh-CN': '塞拉利昂',
    en: 'Sierra Leone'
  },
  {
    code: '221',
    'zh-CN': '塞内加尔',
    en: 'Senegal'
  },
  {
    code: '357',
    'zh-CN': '塞浦路斯',
    en: 'Cyprus'
  },
  {
    code: '248',
    'zh-CN': '塞舌尔',
    en: 'Seychelles'
  },
  {
    code: '966',
    'zh-CN': '沙特阿拉伯',
    en: 'Saudi Arabia'
  },
  {
    code: '260',
    'zh-CN': '尚比亚',
    en: 'Zambia'
  },
  {
    code: '590',
    'zh-CN': '圣巴泰勒米',
    en: 'Saint Barthelemy'
  },
  {
    code: '239',
    'zh-CN': '圣多美和普林西比',
    en: 'Sao Tome and Principe'
  },
  {
    code: '1758',
    'zh-CN': '圣卢西亚',
    en: 'Saint Lucia'
  },
  {
    code: '590',
    'zh-CN': '圣马丁岛',
    en: 'Saint Martin'
  },
  {
    code: '378',
    'zh-CN': '圣马力诺',
    en: 'San Marino'
  },
  {
    code: '508',
    'zh-CN': '圣皮埃尔和密克隆岛',
    en: 'Saint Pierre and Miq'
  },
  {
    code: '1784',
    'zh-CN': '圣文森特和格林纳丁斯',
    en: 'Saint Vincent and the Grenadines'
  },
  {
    code: '94',
    'zh-CN': '斯里兰卡',
    en: 'Sri Lanka'
  },
  {
    code: '421',
    'zh-CN': '斯洛伐克',
    en: 'Slovakia'
  },
  {
    code: '386',
    'zh-CN': '斯洛文尼亚',
    en: 'Slovenia'
  },
  {
    code: '268',
    'zh-CN': '斯威士兰',
    en: 'Swaziland'
  },
  {
    code: '249',
    'zh-CN': '苏丹',
    en: 'Sudan'
  },
  {
    code: '597',
    'zh-CN': '苏里南',
    en: 'Suriname'
  },
  {
    code: '677',
    'zh-CN': '所罗门群岛',
    en: 'Solomon Islands'
  },
  {
    code: '252',
    'zh-CN': '索马里',
    en: 'Somalia'
  },
  {
    code: '992',
    'zh-CN': '塔吉克斯坦',
    en: 'Tajikistan'
  },
  {
    code: '255',
    'zh-CN': '坦桑尼亚',
    en: 'Tanzania'
  },
  {
    code: '676',
    'zh-CN': '汤加',
    en: 'Tonga'
  },
  {
    code: '1868',
    'zh-CN': '特立尼达和多巴哥',
    en: 'Trinidad and Tobago'
  },
  {
    code: '216',
    'zh-CN': '突尼斯',
    en: 'Tunisia'
  },
  {
    code: '688',
    'zh-CN': '图瓦卢',
    en: 'Tuvalu'
  },
  {
    code: '90',
    'zh-CN': '土耳其',
    en: 'Turkey'
  },
  {
    code: '993',
    'zh-CN': '土库曼斯坦',
    en: 'Turkmenstan'
  },
  {
    code: '690',
    'zh-CN': '托克劳群岛',
    en: 'Tokelau'
  },
  {
    code: '681',
    'zh-CN': '瓦利斯和富图纳群岛',
    en: 'Wallis And Futuna Is'
  },
  {
    code: '678',
    'zh-CN': '瓦努阿图',
    en: 'Vanuatu'
  },
  {
    code: '502',
    'zh-CN': '危地马拉',
    en: 'Guatemala'
  },
  {
    code: '58',
    'zh-CN': '委内瑞拉',
    en: 'Venezuela'
  },
  {
    code: '673',
    'zh-CN': '文莱',
    en: 'Brunei'
  },
  {
    code: '256',
    'zh-CN': '乌干达',
    en: 'Uganda'
  },
  {
    code: '380',
    'zh-CN': '乌克兰',
    en: 'Ukraine'
  },
  {
    code: '598',
    'zh-CN': '乌拉圭',
    en: 'Uruguay'
  },
  {
    code: '998',
    'zh-CN': '乌兹别克斯坦',
    en: 'Uzbekistan'
  },
  {
    code: '34',
    'zh-CN': '西班牙',
    en: 'Spain'
  },
  {
    code: '212',
    'zh-CN': '西撒哈拉国',
    en: 'Western Sahara'
  },
  {
    code: '685',
    'zh-CN': '西萨摩亚',
    en: 'Samoa Western'
  },
  {
    code: '30',
    'zh-CN': '希腊',
    en: 'Greece'
  },
  {
    code: '687',
    'zh-CN': '新喀里多尼亚',
    en: 'New Caledonia'
  },
  {
    code: '36',
    'zh-CN': '匈牙利',
    en: 'Hungary'
  },
  {
    code: '963',
    'zh-CN': '叙利亚',
    en: 'Syria'
  },
  {
    code: '1876',
    'zh-CN': '牙买加',
    en: 'Jamaica'
  },
  {
    code: '374',
    'zh-CN': '亚美尼亚',
    en: 'Armenia'
  },
  {
    code: '967',
    'zh-CN': '也门',
    en: 'Yemen'
  },
  {
    code: '964',
    'zh-CN': '伊拉克',
    en: 'Iraq'
  },
  {
    code: '98',
    'zh-CN': '伊朗',
    en: 'Iran'
  },
  {
    code: '972',
    'zh-CN': '以色列',
    en: 'Israel'
  },
  {
    code: '962',
    'zh-CN': '约旦',
    en: 'Jordan'
  },
  {
    code: '243',
    'zh-CN': '扎伊尔',
    en: 'Zaire'
  },
  {
    code: '235',
    'zh-CN': '乍得',
    en: 'Chad'
  },
  {
    code: '350',
    'zh-CN': '直布罗陀',
    en: 'Gibraltar'
  },
  {
    code: '56',
    'zh-CN': '智利',
    en: 'Chile'
  },
  {
    code: '236',
    'zh-CN': '中非共和国',
    en: 'Central Africa Republic'
  }
]

export default areaCode
