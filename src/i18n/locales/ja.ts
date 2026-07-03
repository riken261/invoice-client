export const ja = {
  translation: {
    app: {
      navigation: {
        back: "戻る",
      },
      title: "請求書精算",
      subtitle:
        "アップロード、OCR、承認、精算、監査ワークフローのフロントエンド基盤",
    },
    auth: {
      login: {
        brand: "Invoice Flow System",
        emailLabel: "会社ドメインのメール",
        emailPlaceholder: "your-email@your-company-domain.com",
        forgotPassword: "パスワードをお忘れですか？",
        hidePassword: "パスワードを非表示",
        noAccount: "アカウントをお持ちではありませんか？",
        passwordLabel: "パスワード",
        passwordPlaceholder: "パスワードを入力",
        registerNow: "今すぐ登録",
        rememberMe: "ログイン状態を保持",
        showPassword: "パスワードを表示",
        signIn: "ログイン",
        signInWith: "または以下でログイン",
        sso: "企業 SSO",
        ssoCallbackFailed:
          "SSO コールバック処理に失敗しました。もう一度お試しください。",
        ssoCallbackMissingParams:
          "SSO コールバックのパラメータが不足しています。再度ログインしてください。",
        ssoCallbackProcessing: "SSO ログインを完了しています...",
        ssoLoginFailed:
          "SSO ログイン URL を取得できません。もう一度お試しください。",
        ssoRedirecting: "リダイレクト中...",
        validation: {
          emailInvalid: "有効なメールアドレスを入力してください。",
          emailRequired: "会社メールを入力してください。",
          passwordRequired: "パスワードを入力してください。",
        },
      },
      logout: {
        logoutTxt: "ログアウト",
      },
    },
    actions: {
      dark: "ダーク",
      light: "ライト",
      system: "システム",
    },
    language: {
      chinese: "中国語",
      english: "英語",
      japanese: "日本語",
    },
    domains: {
      invoice: "請求書",
      claim: "精算",
      review: "財務承認",
      duplicate: "重複チェック",
      fileArchive: "ファイル保管",
      identity: "ID とテナント",
      authorization: "権限",
      audit: "監査",
      config: "システム設定",
      notification: "通知",
      integration: "連携",
    },
    dashboard: {
      title: "ワークベンチ",
      subtitle: "次の業務操作を選択し、現在の処理待ち状況を確認します。",
      summary: {
        aria: "ワークベンチサマリー",
        loading: "ワークベンチサマリーを読み込んでいます...",
        admin: {
          outboxDeadLetters: "Outbox デッドレター",
          securityEvents: "セキュリティイベント",
          storageFailures: "ストレージ失敗",
          title: "管理サマリー",
        },
        employee: {
          draftClaims: "下書き精算",
          manualInputRequired: "手入力",
          ocrConfirmRequired: "OCR 確認",
          ocrProcessing: "OCR 処理中",
          rejected: "差戻し事項",
          title: "社員サマリー",
        },
        finance: {
          averageWaitingHours: "平均待機時間",
          duplicateInvoices: "重複リスク",
          pendingClaims: "承認待ち精算",
          pendingInvoices: "承認待ち請求書",
          title: "財務サマリー",
        },
      },
      action: {
        admin: {
          outboxDeadLetter: "Outbox デッドレター",
          securityAudit: "セキュリティ監査",
          storageFailure: "ストレージ警告",
          systemConfig: "システム設定",
        },
        claim: {
          apply: "精算を作成",
          query: "精算検索",
          review: "精算承認",
        },
        invoice: {
          preview: "請求書プレビュー",
          submit: "撮影アップロード",
        },
        todo: {
          claimRejectedResubmit: "差戻し精算の再提出",
          claimReview: "精算承認",
        },
      },
      actions: {
        continue: "続行",
        claimCreate: {
          description: "精算申請を作成",
          title: "作成",
        },
        claimPreview: {
          description: "精算申請をプレビュー",
          title: "プレビュー",
        },
        invoiceDownload: {
          description: "請求書を選択してダウンロード",
          title: "ダウンロード",
        },
        invoicePreview: {
          description: "すべての請求書をプレビュー",
          title: "プレビュー",
        },
        invoiceUpload: {
          description: "請求書を撮影またはアップロード",
          title: "アップロード",
        },
      },
      groups: {
        admin: "管理",
        claim: "精算",
        invoice: "請求書",
        todo: "To-do",
      },
      group: {
        admin: "管理",
        claim: "精算",
        invoice: "請求書",
        todo: "To-do",
      },
      state: {
        empty: "利用可能な操作はありません",
        error: "ワークベンチ操作を読み込めません。後でもう一度お試しください。",
        loading: "ワークベンチ操作を読み込んでいます...",
      },
    },
    invoiceUpload: {
      actions: {
        cancel: "キャンセル",
        capture: "撮影",
        end: "終了",
        save: "保存",
        uploadFile: "ファイルアップロード",
        startCamera: "カメラを起動",
        submit: "送信",
      },
      aria: {
        nextPhoto: "次の写真",
        photoPreview: "請求書写真プレビュー",
        previousPhoto: "前の写真",
      },
      canvas: {
        empty: "請求書写真はまだ撮影されていません",
        liveCamera: "ライブカメラ",
        preview: "写真プレビュー",
      },
      errors: {
        cameraDenied:
          "カメラを起動できません。ブラウザの権限を確認して再試行してください。",
        cameraUnavailable:
          "カメラを起動できません。ブラウザの権限を確認してください。",
        invalidFile: "PDF、JPG、PNG の請求書ファイルを選択してください。",
        invalidImage:
          "請求書写真として画像ファイルを選択または撮影してください。",
        readFailed: "写真を読み取れません。もう一度撮影してください。",
      },
      result: "{{count}} 枚の請求書写真をモック送信しました。",
      toast: {
        saved: "撮影が完了しました",
        saveFailed: "写真を保存できません。もう一度撮影してください。",
        saving: "写真を保存しています...",
      },
      ocr: {
        actions: {
          failed: "OCR 失敗",
          success: "OCR 成功",
        },
        metrics: {
          engine: "認識エンジン",
          lastCheckedAt: "最終確認時刻",
          photos: "写真枚数",
          queue: "タスク ID",
        },
        missingInvoice:
          "請求書 ID がありません。もう一度アップロードしてください。",
        panelTitle: "OCR 処理中",
        polling:
          "2 秒ごとに OCR 結果を確認しています。しばらくお待ちください。",
        processing: "請求書画像を処理しています。しばらくお待ちください。",
        ready: "写真が送信されました。OCR 結果を待機しています。",
        subtitle: "請求書コード、番号、日付、金額、税額を認識します。",
        title: "請求書 OCR",
      },
      manual: {
        actions: {
          confirm: "手入力を送信",
          preview: "プレビュー",
        },
        description:
          "OCR で請求書情報を完全に認識できませんでした。確認前に必須項目を補完してください。",
        fields: {
          amount: "税込金額",
          amountWithoutTax: "税抜金額",
          buyerName: "購入者",
          buyerTaxId: "購入者税番号",
          invoiceCode: "請求書コード",
          invoiceDate: "発行日",
          invoiceNumber: "請求書番号",
          sellerName: "販売者",
          sellerTaxId: "販売者税番号",
        },
        missingInvoice:
          "請求書 ID がありません。もう一度アップロードしてください。",
        panelTitle: "手入力",
        previewAlt: "手入力が必要な請求書画像",
        previewUnavailable: "この請求書にはまだプレビュー画像がありません。",
        subtitle: "不足項目を補完して請求書確認へ進みます。",
        title: "請求書の手入力",
      },
      confirm: {
        actions: {
          back: "戻る",
          complete: "確認して登録完了",
        },
        description: "OCR または手入力後の請求書情報を確認してください。",
        fields: {
          amount: "税込金額",
          invoiceCode: "請求書コード",
          invoiceDate: "発行日",
          invoiceNumber: "請求書番号",
          seller: "販売者",
          tax: "税額",
        },
        mock: {
          seller: "上海デモテクノロジー株式会社",
        },
        panelTitle: "請求書情報の確認",
        subtitle: "内容を確認して請求書を保存します。",
        title: "請求書情報確認",
      },
      complete: {
        actions: {
          dashboard: "ワークベンチへ戻る",
        },
        metrics: {
          archive: "精算申請を提出",
          invoiceId: "請求書 ID",
          next: "次の処理",
          saved: "保存済み",
          status: "登録状態",
        },
        subtitle: "請求書情報が保存されました。請求書一覧から確認できます。",
        title: "請求書登録完了",
      },
      title: "請求書アップロード",
    },
    invoiceList: {
      actions: {
        download: "ダウンロード",
        downloadMode: "請求書をダウンロード",
        downloadSelected: "選択 {{count}} 件をダウンロード",
        exitDownload: "ダウンロード終了",
        preview: "表示",
        refresh: "更新",
      },
      columns: {
        actions: "操作",
        amount: "金額",
        invoice: "請求書",
        seller: "販売者",
        select: "選択",
        source: "入力元",
        status: "状態",
        submittedAt: "送信日時",
      },
      filters: {
        all: "すべての状態",
        search: "請求書を検索",
        searchPlaceholder: "請求書 ID、番号、販売者で検索",
      },
      metrics: {
        amount: "送信金額",
        downloadable: "ダウンロード可",
        pending: "処理待ち",
        total: "送信済み請求書",
      },
      source: {
        manual: "手入力",
        ocr: "OCR",
      },
      state: {
        empty: "一致する請求書はありません",
        loading: "請求書一覧を読み込んでいます...",
      },
      status: {
        archived: "保管済み",
        confirmed: "確認済み",
        submitted: "送信済み",
      },
      downloadSubtitle:
        "ダウンロードする請求書ファイルを選択します。単体または一括で操作できます。",
      subtitle: "送信済み請求書の認識結果、処理状態、入力元を確認します。",
      title: "送信済み請求書",
    },
    invoiceDetail: {
      actions: {
        back: "戻る",
        close: "閉じる",
        download: "ダウンロード",
        preview: "プレビュー",
        viewJson: "JSONを表示",
      },
      amount: {
        currency: "通貨",
        tax: "税額",
        title: "金額",
        total: "税込金額",
        withoutTax: "税抜金額",
      },
      basic: {
        buyer: "購入者",
        duplicateStatus: "重複ステータス",
        invoiceCode: "請求書コード",
        invoiceDate: "発行日",
        invoiceNo: "請求書番号",
        invoiceType: "請求書種別",
        manualInput: "手入力",
        ocrStatus: "OCRステータス",
        seller: "販売者",
        status: "ステータス",
        title: "請求書情報",
        updatedAt: "更新日時",
      },
      boolean: {
        no: "いいえ",
        yes: "はい",
      },
      fields: {
        title: "認識フィールド",
      },
      fieldLabels: {
        amount: "金額",
        amountWithoutTax: "税抜金額",
        angle: "傾き",
        buyerName: "購入者",
        buyerTaxId: "購入者税番号",
        checkCode: "チェックコード",
        code: "結果コード",
        confidence: "信頼度",
        currency: "通貨",
        cutImageBase64: "切り抜き画像",
        invoiceCode: "請求書コード",
        invoiceDate: "発行日",
        invoiceNo: "請求書番号",
        invoiceNumber: "請求書番号",
        invoiceType: "請求書種別",
        lowConfidence: "低信頼度",
        page: "ページ",
        providerCode: "プロバイダーコード",
        providerSubType: "プロバイダーサブタイプ",
        providerSubTypeDescription: "プロバイダーサブタイプ説明",
        providerType: "プロバイダータイプ",
        providerTypeDescription: "プロバイダータイプ説明",
        qrCode: "QRコード",
        rawInvoiceInfo: "元の請求書情報",
        seller: "販売者",
        sellerName: "販売者",
        sellerTaxId: "販売者税番号",
        taxAmount: "税額",
        title: "タイトル",
        totalAmount: "税込金額",
      },
      preview: {
        expiresAt: "有効期限",
        title: "プレビュー",
      },
      rawJson: {
        description: "確認用に整形したOCRの元レスポンスです。",
        title: "元JSON",
      },
      state: {
        loading: "請求書詳細を読み込んでいます...",
      },
      title: "請求書詳細",
    },
    claimList: {
      actions: {
        abandon: "放棄",
        create: "精算を作成",
        refresh: "更新",
        resubmit: "再提出",
        view: "表示",
      },
      category: {
        meal: "食事",
        office: "備品",
        service: "サービス",
        travel: "出張",
      },
      columns: {
        actions: "操作",
        amount: "金額",
        category: "費用区分",
        claim: "精算申請",
        invoices: "請求書数",
        status: "状態",
        submittedAt: "提出日時",
      },
      filters: {
        all: "すべての状態",
        search: "精算申請を検索",
        searchPlaceholder: "申請 ID、タイトル、申請者で検索",
      },
      metrics: {
        amount: "精算金額",
        rejected: "差戻し",
        submitted: "承認待ち",
        total: "精算申請",
      },
      state: {
        empty: "一致する精算申請はありません",
        loading: "精算申請を読み込んでいます...",
      },
      status: {
        archived: "放棄済み",
        draft: "下書き",
        paid: "支払済み",
        rejected: "差戻し",
        submitted: "承認中",
      },
      subtitle: "精算申請の状態、金額、請求書数、差戻し再提出を確認します。",
      title: "精算申請",
    },
    claimCreate: {
      actions: {
        back: "一覧へ戻る",
        resubmit: "再提出",
        saveDraft: "下書き保存",
        submit: "承認へ提出",
      },
      category: {
        meal: "食事",
        office: "備品",
        service: "サービス",
        travel: "出張",
      },
      fields: {
        category: "費用区分",
        description: "精算説明",
        descriptionPlaceholder: "業務目的を入力",
      },
      details: {
        amount: "金額",
        category: "費用区分",
        empty: "先に精算可能な請求書を選択してください。",
        invoice: "請求書",
        seller: "販売者",
        title: "精算明細",
      },
      invoicePicker: {
        title: "精算可能な請求書を選択",
      },
      prefill: {
        rejectedDescription: "業務説明を補足してから再提出してください。",
      },
      rejectedNotice: {
        title: "差戻し理由",
      },
      result: "モック精算申請 {{claimId}} を生成しました。",
      resubmitTitle: "差戻し再提出",
      summary: {
        amount: "合計金額",
        category: "費用区分",
        invoiceCount: "選択済み請求書",
        needDescription: "説明が必要",
        ready: "提出可能",
        status: "検証状態",
        title: "精算サマリー",
      },
      subtitle:
        "確認済み請求書を選択し、費用区分と説明を入力して保存または提出します。",
      title: "精算申請を作成",
    },
    claimDetail: {
      actions: {
        abandon: "放棄",
        back: "一覧へ戻る",
        resubmit: "再提出",
      },
      basic: {
        amount: "精算金額",
        applicant: "申請者",
        category: "費用区分",
        claimTitle: "タイトル",
        description: "精算説明",
        rejectedReason: "差戻し理由",
        status: "状態",
        submittedAt: "提出日時",
        title: "基本情報",
      },
      category: {
        meal: "食事",
        office: "備品",
        service: "サービス",
        travel: "出張",
      },
      invoices: {
        amount: "金額",
        category: "費用区分",
        invoice: "請求書",
        seller: "販売者",
        title: "精算明細",
      },
      status: {
        archived: "放棄済み",
        draft: "下書き",
        paid: "支払済み",
        rejected: "差戻し",
        submitted: "承認中",
      },
      timeline: {
        action: {
          approved: "承認済み",
          created: "作成",
          paid: "支払完了",
          rejected: "差戻し",
          submitted: "提出",
        },
        title: "承認タイムライン",
      },
      title: "精算申請詳細",
    },
    financeReview: {
      actions: {
        refresh: "更新",
      },
      metrics: {
        amount: "承認待ち金額",
        duplicateRisk: "重複リスク",
        pendingClaims: "承認待ち精算",
        pendingInvoices: "承認待ち請求書",
      },
      queues: {
        claims: {
          description: "精算申請、請求書明細、業務説明を確認します。",
          title: "精算承認",
        },
        duplicates: {
          description: "重複の疑いがある請求書を優先処理します。",
          title: "重複リスク",
        },
        invoices: {
          description: "OCR、重複、請求書ファイルを確認します。",
          title: "請求書承認",
        },
      },
      subtitle: "提出済み精算申請を処理し、承認後に BOE へ送信します。",
      title: "財務ワークベンチ",
    },
    invoiceReviewList: {
      actions: {
        refresh: "更新",
        review: "承認",
        workbench: "ワークベンチ",
      },
      columns: {
        actions: "操作",
        amount: "金額",
        confidence: "OCR 信頼度",
        invoice: "請求書",
        risk: "リスク",
        seller: "販売者",
        status: "状態",
      },
      filters: {
        all: "すべての状態",
        search: "請求書承認を検索",
        searchPlaceholder: "請求書 ID、番号、販売者、申請者で検索",
      },
      state: {
        empty: "一致する請求書承認事項はありません",
        loading: "請求書承認キューを読み込んでいます...",
      },
      subtitle: "提出済み請求書の OCR 結果、重複リスク、承認状態を確認します。",
      title: "請求書承認",
    },
    claimReviewList: {
      actions: {
        refresh: "更新",
        review: "承認",
        workbench: "ワークベンチ",
      },
      columns: {
        actions: "操作",
        amount: "金額",
        applicant: "申請者",
        claim: "精算申請",
        invoices: "請求書数",
        status: "状態",
        submittedAt: "提出日時",
      },
      filters: {
        all: "すべての状態",
        search: "精算承認を検索",
        searchPlaceholder: "申請 ID、タイトル、申請者で検索",
      },
      state: {
        empty: "一致する精算承認事項はありません",
        loading: "精算承認キューを読み込んでいます...",
      },
      subtitle: "精算申請の基本情報、請求書明細、業務説明を確認します。",
      title: "精算承認",
    },
    invoiceReview: {
      actions: {
        back: "請求書承認へ戻る",
      },
      basic: {
        amount: "金額",
        applicant: "申請者",
        risk: "重複リスク",
        seller: "販売者",
        status: "状態",
        submittedAt: "提出日時",
        title: "請求書情報",
      },
      duplicate: {
        empty: "重複請求書は見つかりませんでした。",
        hit: "重複の疑いがある請求書",
        title: "重複チェック結果",
      },
      ocr: {
        confidence: "全体信頼度 {{value}}",
        fieldConfidence: "項目信頼度 {{value}}",
        originalValue: "OCR 原文：{{value}}",
        title: "OCR と確認結果",
      },
      preview: {
        subtitle:
          "ファイルプレビューのプレースホルダーです。後でオブジェクトストレージの署名付き URL を接続します。",
      },
      result: {
        approved: "請求書 {{invoiceId}} の承認をモックしました。",
        rejected: "請求書 {{invoiceId}} の差戻しをモックしました。",
      },
      title: "請求書承認詳細",
    },
    claimReview: {
      actions: {
        back: "精算承認へ戻る",
      },
      basic: {
        amount: "精算金額",
        applicant: "申請者",
        category: "費用区分",
        claimTitle: "タイトル",
        description: "精算説明",
        status: "状態",
        submittedAt: "提出日時",
        title: "精算申請情報",
      },
      category: {
        meal: "食事",
        office: "備品",
        service: "サービス",
        travel: "出張",
      },
      invoices: {
        amount: "金額",
        category: "費用区分",
        invoice: "請求書",
        seller: "販売者",
        title: "精算明細",
        total: "合計",
      },
      result: {
        approved: "精算申請 {{claimId}} を承認しました。",
        rejected: "精算申請 {{claimId}} を差戻しました。",
      },
      title: "精算承認詳細",
    },
    reviewDecision: {
      approve: "承認",
      comment: "承認コメント",
      commentPlaceholder: "承認メモまたは差戻し理由を入力",
      reject: "差戻し",
      title: "承認処理",
    },
    reviewRisk: {
      high: "高",
      low: "低",
      medium: "中",
    },
    reviewStatus: {
      approved: "承認済み",
      duplicate: "重複疑い",
      escalated: "エスカレーション済み",
      pending: "承認待ち",
      rejected: "差戻し済み",
    },
    reviewTimeline: {
      action: {
        approved: "承認済み",
        created: "作成",
        duplicateChecked: "重複チェック完了",
        ocrConfirmed: "OCR 確認",
        rejected: "差戻し",
        reviewing: "承認中",
        submitted: "提出",
      },
      title: "承認タイムライン",
    },
    adminCommon: {
      actions: {
        refresh: "更新",
      },
    },
    adminOutbox: {
      actions: {
        archive: "アーカイブ",
        replay: "再実行",
      },
      columns: {
        actions: "操作",
        aggregate: "集約",
        event: "イベント",
        failedAt: "失敗日時",
        retryCount: "再試行",
        routingKey: "ルーティングキー",
        status: "状態",
      },
      filters: {
        all: "すべての状態",
        search: "デッドレターを検索",
        searchPlaceholder: "イベント、集約、ルーティングキー、エラーで検索",
      },
      metrics: {
        deadLetter: "デッドレター",
        maxRetry: "最大再試行",
        retrying: "再試行中",
        total: "イベント数",
      },
      result: {
        archive: "{{id}} のアーカイブをモックしました。",
        replay: "{{id}} の再実行をモックしました。",
      },
      state: {
        empty: "一致する Outbox イベントはありません",
        loading: "Outbox デッドレターを読み込んでいます...",
      },
      status: {
        deadLetter: "デッドレター",
        resolved: "処理済み",
        retrying: "再試行中",
      },
      subtitle:
        "MQ 配信失敗後の Outbox デッドレターを処理し、再実行とアーカイブを行います。",
      title: "Outbox デッドレター処理",
    },
    adminStorage: {
      actions: {
        ignore: "無視",
        preview: "プレビュー",
        retry: "再試行",
      },
      columns: {
        actions: "操作",
        failedAt: "失敗日時",
        file: "ファイル",
        objectKey: "オブジェクトキー",
        provider: "ストレージ",
        retryCount: "再試行",
        status: "状態",
      },
      filters: {
        all: "すべての状態",
        search: "ストレージ失敗を検索",
        searchPlaceholder:
          "ファイル、請求書、オブジェクトキー、ストレージ、エラーで検索",
      },
      metrics: {
        failed: "失敗",
        providers: "ストレージ種別",
        retrying: "再試行中",
        total: "異常数",
      },
      result: {
        ignore: "{{id}} の無視をモックしました。",
        preview: "{{id}} のファイルプレビューをモックしました。",
        retry: "{{id}} の再試行をモックしました。",
      },
      state: {
        empty: "一致するストレージ異常はありません",
        loading: "ストレージ失敗を読み込んでいます...",
      },
      status: {
        failed: "失敗",
        ignored: "無視済み",
        retrying: "再試行中",
      },
      subtitle:
        "オブジェクトストレージのアップロード、保管、プレビューの異常を確認して再試行します。",
      title: "ストレージ失敗",
    },
    adminOcrTasks: {
      actions: {
        detail: "詳細",
        ignore: "無視",
        retry: "再試行",
      },
      columns: {
        actions: "操作",
        failedAt: "失敗日時",
        failure: "失敗理由",
        invoice: "請求書 / ファイル",
        provider: "プロバイダー",
        retryCount: "再試行",
        status: "状態",
        task: "タスク",
      },
      filters: {
        all: "すべての状態",
        search: "OCR タスクを検索",
        searchPlaceholder:
          "タスク、請求書、ファイル、プロバイダー、所有者、エラーで検索",
      },
      metrics: {
        dead: "デッド",
        failed: "失敗",
        retrying: "再試行中",
        total: "タスク数",
      },
      result: {
        detail: "OCR タスク {{id}} の詳細表示をモックしました。",
        ignore: "OCR タスク {{id}} の無視をモックしました。",
        retry: "OCR タスク {{id}} の再試行をモックしました。",
      },
      state: {
        empty: "一致する OCR タスクはありません",
        loading: "OCR 失敗タスクを読み込んでいます...",
      },
      status: {
        dead: "デッド",
        failed: "失敗",
        ignored: "無視済み",
        retrying: "再試行中",
      },
      subtitle:
        "OCR 認識に失敗したセッションを確認し、再試行または無視をシミュレートします。",
      title: "OCR 失敗タスク",
    },
    adminSecurityAudit: {
      actions: {
        export: "エクスポート",
        trace: "トレース",
      },
      columns: {
        action: "操作",
        actions: "操作",
        actor: "実行者",
        occurredAt: "発生日時",
        resource: "リソース",
        result: "結果",
        risk: "リスク",
        sourceIp: "送信元 IP",
      },
      filters: {
        all: "すべてのリスク",
        search: "監査ログを検索",
        searchPlaceholder: "操作、実行者、リソース、IP、traceId で検索",
      },
      metrics: {
        actors: "実行者",
        blocked: "ブロック",
        highRisk: "高リスク",
        total: "監査ログ",
      },
      result: {
        export: "現在のセキュリティ監査結果のエクスポートをモックしました。",
        trace: "トレース {{traceId}} を開く操作をモックしました。",
      },
      resultStatus: {
        blocked: "ブロック",
        failed: "失敗",
        success: "成功",
      },
      risk: {
        high: "高",
        low: "低",
        medium: "中",
      },
      state: {
        empty: "一致するセキュリティ監査ログはありません",
        loading: "セキュリティ監査ログを読み込んでいます...",
      },
      subtitle:
        "機密操作、ログインブロック、不正アクセス、設定変更の監査ログを検索します。",
      title: "セキュリティ監査",
    },
    adminSystemConfig: {
      actions: {
        save: "設定を保存",
        test: "接続テスト",
      },
      fields: {
        mq: {
          host: "RabbitMQ アドレス",
          provider: "MQ 種別",
          username: "ユーザー名",
          vhost: "VHost",
        },
        ocr: {
          provider: "OCR プロバイダー",
          region: "リージョン",
          secretId: "SecretId",
          timeout: "タイムアウト",
        },
        security: {
          auditLevel: "監査レベル",
          csrf: "CSRF",
          issuer: "OIDC Issuer",
          sessionTtl: "セッション TTL",
        },
        storage: {
          bucket: "Bucket",
          endpoint: "Endpoint",
          provider: "ストレージ種別",
          retentionDays: "保持日数",
        },
      },
      metrics: {
        environment: "環境",
        masked: "マスク項目",
        sections: "設定グループ",
        status: "状態",
      },
      result: {
        save: "システム設定の保存をモックしました。",
        test: "OCR、ストレージ、MQ、セキュリティ設定の接続テストをモックしました。",
      },
      sections: {
        mq: {
          title: "RabbitMQ",
        },
        ocr: {
          title: "OCR",
        },
        security: {
          title: "セキュリティ",
        },
        storage: {
          title: "オブジェクトストレージ",
        },
      },
      status: {
        active: "有効",
      },
      subtitle:
        "テナント単位の OCR、オブジェクトストレージ、MQ、セキュリティポリシーを管理します。",
      title: "システム設定",
    },
  },
} as const;
