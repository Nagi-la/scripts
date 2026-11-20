function operator(proxies) {
  const args = $arguments ?? {}
  const lang = args.lang === 'en' ? 'en' : 'zh'

  const ipMap = {
    'p-s2.presntp.uk': [
    ],
    'p-s4.presntp.uk': [
    ],
    'p-gtm.presntp.uk': [
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
