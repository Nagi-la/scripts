function operator(proxies) {
  const args = $arguments ?? {}
  const lang = args.lang === 'en' ? 'en' : 'zh'

  const ipMap = {
    'p-s2.presntp.uk': [
      ['103.109.23.144', '电信', 'CT'],
      ['183.60.148.38', '电信', 'CT'],
      ['27.44.141.232', '联通', 'CU'],
      ['27.44.141.234', '联通', 'CU']
    ],
    'p-s4.presntp.uk': [
      ['103.109.23.144', '电信', 'CT'],
      ['183.60.148.38', '电信', 'CT'],
      ['27.44.141.232', '联通', 'CU'],
      ['27.44.141.234', '联通', 'CU']
    ],
    'p-gtm.presntp.uk': [
      ['103.109.23.144', '电信', 'CT'],
      ['183.60.148.38', '电信', 'CT'],
      ['27.44.141.232', '联通', 'CU'],
      ['27.44.141.234', '联通', 'CU']
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
