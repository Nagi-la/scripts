function operator(proxies) {
  const args = $arguments ?? {}
  const lang = args.lang === 'en' ? 'en' : 'zh'

  // BEGIN PRESNTP DOMESTIC STANDBYS
  // 候补仅记录，不额外生成节点；主入口移除经复核后替换。
  // p-s2.presntp.uk | 电信 | 183.60.148.36, 183.60.148.38
  // p-s2.presntp.uk | 联通 | 27.44.141.234
  // p-s4.presntp.uk | 电信 | 183.60.148.36, 183.60.148.38
  // p-s4.presntp.uk | 联通 | 27.44.141.234
  // p-gtm.presntp.uk | 电信 | 183.60.148.36, 183.60.148.38
  // p-gtm.presntp.uk | 联通 | 27.44.141.234
  // END PRESNTP DOMESTIC STANDBYS

  const ipMap = {
    'p-s2.presntp.uk': [
      ['183.60.148.38', '电信', 'CT'],
      ['27.44.141.232', '联通', 'CU']
    ],
    'p-s4.presntp.uk': [
      ['183.60.148.38', '电信', 'CT'],
      ['27.44.141.232', '联通', 'CU']
    ],
    'p-gtm.presntp.uk': [
      ['183.60.148.38', '电信', 'CT'],
      ['27.44.141.232', '联通', 'CU']
    ]
  }

  return (proxies || []).flatMap(template => {
    const entries = ipMap[template?.server]

    // 未匹配域名的节点原样保留
    if (!entries) return [template]

    return entries.map(([ip, zh, code]) => ({
      ...template,
      server: ip,
      name: `${template.name} [${lang === 'zh' ? zh : code}]`
    }))
  })
}
