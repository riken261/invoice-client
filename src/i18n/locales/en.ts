export const en = {
  translation: {
    app: {
      navigation: {
        back: "Back",
      },
      title: "Invoice Reimbursement",
      subtitle:
        "Frontend foundation for upload, OCR, review, claim, and audit workflows",
    },
    auth: {
      login: {
        brand: "Invoice Flow System",
        emailLabel: "company domain email",
        emailPlaceholder: "your-email@your-company-domain.com",
        forgotPassword: "Forgot your password?",
        hidePassword: "Hide password",
        noAccount: "Don't have an account yet?",
        passwordLabel: "Password",
        passwordPlaceholder: "your-password",
        registerNow: "Register now",
        rememberMe: "Remember me",
        showPassword: "Show password",
        signIn: "Sign in",
        signInWith: "or sign in with",
        sso: "Company SSO",
        ssoCallbackFailed: "SSO callback failed. Please try again.",
        ssoCallbackMissingParams:
          "SSO callback parameters are missing. Please sign in again.",
        ssoCallbackProcessing: "Completing SSO sign-in...",
        ssoLoginFailed: "Unable to get the SSO sign-in URL. Please try again.",
        ssoRedirecting: "Redirecting...",
        validation: {
          emailInvalid: "Enter a valid email address.",
          emailRequired: "Company email is required.",
          passwordRequired: "Password is required.",
        },
      },
      logout: {
        logoutTxt: "Logout",
      },
    },
    actions: {
      dark: "Dark",
      light: "Light",
      system: "System",
    },
    language: {
      chinese: "Chinese",
      english: "English",
      japanese: "Japanese",
    },
    domains: {
      invoice: "Invoice",
      claim: "Claim",
      review: "Finance review",
      duplicate: "Duplicate check",
      fileArchive: "File archive",
      identity: "Identity and tenant",
      authorization: "Authorization",
      audit: "Audit",
      config: "System config",
      notification: "Notification",
      integration: "Integration",
    },
    dashboard: {
      title: "Workbench",
      subtitle:
        "Pick the next operational task and review the current workload.",
      summary: {
        aria: "Dashboard summary",
        loading: "Loading dashboard summary...",
        admin: {
          outboxDeadLetters: "Outbox dead letters",
          securityEvents: "Security events",
          storageFailures: "Storage failures",
          title: "Admin summary",
        },
        employee: {
          draftClaims: "Draft claims",
          manualInputRequired: "Manual input",
          ocrConfirmRequired: "OCR confirmation",
          ocrProcessing: "OCR processing",
          rejected: "Rejected items",
          title: "Employee summary",
        },
        finance: {
          averageWaitingHours: "Avg waiting hours",
          duplicateInvoices: "Duplicate risk",
          pendingClaims: "Pending claims",
          pendingInvoices: "Pending invoices",
          title: "Finance summary",
        },
      },
      action: {
        admin: {
          outboxDeadLetter: "Outbox dead letters",
          securityAudit: "Security audit",
          storageFailure: "Storage alerts",
        },
        claim: {
          apply: "Create claim",
          query: "Claim query",
          review: "Claim review",
        },
        invoice: {
          preview: "Invoice preview",
          submit: "Capture upload",
        },
        todo: {
          claimRejectedResubmit: "Resubmit rejected claim",
          claimReview: "Claim review",
        },
      },
      actions: {
        continue: "Continue",
        claimCreate: {
          description: "Create a reimbursement claim",
          title: "Create",
        },
        claimPreview: {
          description: "Preview reimbursement claims",
          title: "Preview",
        },
        invoiceDownload: {
          description: "Select invoices to download",
          title: "Download",
        },
        invoicePreview: {
          description: "Preview all invoices",
          title: "Preview",
        },
        invoiceUpload: {
          description: "Capture or upload invoices",
          title: "Upload",
        },
      },
      groups: {
        admin: "Admin",
        claim: "Claim",
        invoice: "Invoice",
        todo: "To-do",
      },
      group: {
        admin: "Admin",
        claim: "Claim",
        invoice: "Invoice",
        todo: "To-do",
      },
      state: {
        empty: "No available actions",
        error: "Unable to load dashboard actions. Please try again later.",
        loading: "Loading dashboard actions...",
      },
    },
    invoiceUpload: {
      actions: {
        cancel: "Cancel",
        capture: "Capture",
        end: "End",
        uploadFile: "Upload file",
        save: "Save",
        startCamera: "Start camera",
        submit: "Submit",
      },
      aria: {
        nextPhoto: "Next photo",
        photoPreview: "Invoice photo preview",
        previousPhoto: "Previous photo",
      },
      canvas: {
        empty: "No invoice photo captured yet",
        liveCamera: "Live camera",
        preview: "Photo preview",
      },
      errors: {
        cameraDenied:
          "Unable to start the camera. Check browser permissions and try again.",
        cameraUnavailable:
          "Unable to start the camera. Check browser permissions.",
        invalidFile: "Choose a PDF, JPG, or PNG invoice file.",
        invalidImage: "Choose or capture an image file for the invoice photo.",
        readFailed: "Unable to read the photo. Please capture it again.",
      },
      result: "Mock submitted {{count}} invoice photos.",
      toast: {
        saved: "Capture completed",
        saveFailed: "Unable to save the photo. Please capture it again.",
        saving: "Saving photo...",
      },
      ocr: {
        actions: {
          failed: "OCR failed",
          success: "OCR succeeded",
        },
        metrics: {
          engine: "Recognition engine",
          lastCheckedAt: "Last checked",
          photos: "Photos",
          queue: "Task ID",
        },
        missingInvoice: "Missing invoice ID. Please upload the invoice again.",
        panelTitle: "OCR in progress",
        polling: "Checking OCR result every 2 seconds. Please wait.",
        processing: "Processing invoice images. Please wait.",
        ready: "Photos submitted. Waiting for the OCR result.",
        subtitle:
          "The system recognizes invoice code, number, date, amount, and tax.",
        title: "Invoice OCR",
      },
      manual: {
        actions: {
          confirm: "Submit manual input",
          preview: "Preview",
        },
        description:
          "OCR could not recognize all invoice details. Complete the required fields before confirmation.",
        fields: {
          amount: "Tax-included amount",
          amountWithoutTax: "Amount without tax",
          buyerName: "Buyer",
          buyerTaxId: "Buyer tax ID",
          invoiceCode: "Invoice code",
          invoiceDate: "Invoice date",
          invoiceNumber: "Invoice number",
          sellerName: "Seller",
          sellerTaxId: "Seller tax ID",
        },
        missingInvoice: "Missing invoice ID. Please upload the invoice again.",
        panelTitle: "Manual input",
        previewAlt: "Invoice image requiring manual input",
        previewUnavailable:
          "No preview image is available for this invoice yet.",
        subtitle: "Complete missing fields before invoice confirmation.",
        title: "Manual Invoice Input",
      },
      confirm: {
        actions: {
          back: "Back",
          complete: "Confirm and complete",
        },
        description: "Review the invoice details from OCR or manual input.",
        fields: {
          amount: "Tax-included amount",
          invoiceCode: "Invoice code",
          invoiceDate: "Invoice date",
          invoiceNumber: "Invoice number",
          seller: "Seller",
          tax: "Tax",
        },
        mock: {
          seller: "Shanghai Demo Technology Co., Ltd.",
        },
        missingSession:
          "Missing recognition session. Please upload the invoice again.",
        panelTitle: "Invoice confirmation",
        subtitle: "Save the invoice after confirming the details.",
        title: "Confirm Invoice Details",
      },
      complete: {
        actions: {
          dashboard: "Back to dashboard",
        },
        metrics: {
          archive: "Submit claim",
          invoiceId: "Invoice ID",
          next: "Next step",
          saved: "Saved",
          status: "Entry status",
        },
        subtitle:
          "The invoice has been saved and can be reviewed from the invoice list.",
        title: "Invoice Entry Completed",
      },
      title: "Invoice Upload",
    },
    invoiceList: {
      actions: {
        download: "Download",
        downloadMode: "Download invoices",
        downloadSelected: "Download selected {{count}}",
        exitDownload: "Exit download",
        preview: "Preview",
        refresh: "Refresh",
      },
      columns: {
        actions: "Actions",
        amount: "Amount",
        invoice: "Invoice",
        seller: "Seller",
        select: "Select",
        source: "Source",
        status: "Status",
        submittedAt: "Submitted at",
      },
      filters: {
        all: "All statuses",
        search: "Search invoices",
        searchPlaceholder: "Search by invoice ID, number, or seller",
      },
      metrics: {
        amount: "Submitted amount",
        downloadable: "Downloadable",
        pending: "Pending",
        total: "Submitted invoices",
      },
      source: {
        manual: "Manual input",
        ocr: "OCR",
      },
      state: {
        empty: "No matching invoices",
        loading: "Loading invoices...",
      },
      status: {
        archived: "Archived",
        confirmed: "Confirmed",
        rejected: "Rejected",
        submitted: "Submitted",
      },
      downloadSubtitle:
        "Select invoice files to download individually or in batches.",
      subtitle:
        "Review submitted invoice recognition results, processing status, and entry source.",
      title: "Submitted Invoices",
    },
    invoiceDetail: {
      actions: {
        back: "Back",
        close: "Close",
        download: "Download",
        preview: "Preview",
        viewJson: "View JSON",
      },
      amount: {
        currency: "Currency",
        tax: "Tax",
        title: "Amount",
        total: "Total amount",
        withoutTax: "Amount without tax",
      },
      basic: {
        buyer: "Buyer",
        duplicateStatus: "Duplicate status",
        invoiceCode: "Invoice code",
        invoiceDate: "Invoice date",
        invoiceNo: "Invoice number",
        invoiceType: "Invoice type",
        manualInput: "Manual input",
        ocrStatus: "OCR status",
        seller: "Seller",
        status: "Status",
        title: "Invoice information",
        updatedAt: "Updated at",
      },
      boolean: {
        no: "No",
        yes: "Yes",
      },
      fields: {
        title: "Recognized fields",
      },
      fieldLabels: {
        amount: "Amount",
        amountWithoutTax: "Amount without tax",
        angle: "Angle",
        buyerName: "Buyer",
        buyerTaxId: "Buyer tax ID",
        checkCode: "Check code",
        code: "Result code",
        confidence: "Confidence",
        currency: "Currency",
        cutImageBase64: "Cropped image",
        invoiceCode: "Invoice code",
        invoiceDate: "Invoice date",
        invoiceNo: "Invoice number",
        invoiceNumber: "Invoice number",
        invoiceType: "Invoice type",
        lowConfidence: "Low confidence",
        page: "Page",
        providerCode: "Provider code",
        providerSubType: "Provider subtype",
        providerSubTypeDescription: "Provider subtype description",
        providerType: "Provider type",
        providerTypeDescription: "Provider type description",
        qrCode: "QR code",
        rawInvoiceInfo: "Raw invoice information",
        seller: "Seller",
        sellerName: "Seller",
        sellerTaxId: "Seller tax ID",
        taxAmount: "Tax",
        title: "Title",
        totalAmount: "Total amount",
      },
      preview: {
        expiresAt: "Expires at",
        title: "Preview",
      },
      rawJson: {
        description: "Formatted raw OCR response for review.",
        title: "Raw JSON",
      },
      state: {
        loading: "Loading invoice detail...",
      },
      title: "Invoice detail",
    },
    claimList: {
      actions: {
        abandon: "Abandon",
        create: "Create claim",
        refresh: "Refresh",
        resubmit: "Resubmit",
        view: "View",
      },
      category: {
        meal: "Meal",
        office: "Office",
        service: "Service",
        travel: "Travel",
      },
      columns: {
        actions: "Actions",
        amount: "Amount",
        category: "Category",
        claim: "Claim",
        invoices: "Invoices",
        status: "Status",
        submittedAt: "Submitted at",
      },
      filters: {
        all: "All statuses",
        search: "Search claims",
        searchPlaceholder: "Search by claim ID, title, or applicant",
      },
      metrics: {
        amount: "Claim amount",
        rejected: "Rejected",
        submitted: "Pending review",
        total: "Claims",
      },
      state: {
        empty: "No matching claims",
        loading: "Loading claims...",
      },
      status: {
        archived: "Abandoned",
        draft: "Draft",
        paid: "Paid",
        rejected: "Rejected",
        submitted: "In review",
      },
      subtitle:
        "Review claim status, amount, invoice count, and rejected resubmissions.",
      title: "Claims",
    },
    claimCreate: {
      actions: {
        back: "Back to list",
        resubmit: "Resubmit",
        saveDraft: "Save draft",
        submit: "Submit for review",
      },
      category: {
        meal: "Meal",
        office: "Office",
        service: "Service",
        travel: "Travel",
      },
      fields: {
        category: "Category",
        description: "Description",
        descriptionPlaceholder: "Describe the business purpose",
      },
      details: {
        amount: "Amount",
        category: "Category",
        empty: "Select reimbursable invoices first.",
        invoice: "Invoice",
        seller: "Seller",
        title: "Claim details",
      },
      invoicePicker: {
        title: "Select reimbursable invoices",
      },
      prefill: {
        rejectedDescription:
          "Add business context before resubmitting this claim.",
      },
      rejectedNotice: {
        title: "Rejected reason",
      },
      result: "Mock claim {{claimId}} has been generated.",
      resubmitTitle: "Resubmit Claim",
      summary: {
        amount: "Total amount",
        category: "Category",
        invoiceCount: "Selected invoices",
        needDescription: "Description needed",
        ready: "Ready",
        status: "Validation",
        title: "Claim summary",
      },
      subtitle:
        "Select confirmed invoices, complete the category and description, then save or submit.",
      title: "Create Claim",
    },
    claimDetail: {
      actions: {
        abandon: "Abandon",
        back: "Back to list",
        resubmit: "Resubmit",
      },
      basic: {
        amount: "Claim amount",
        applicant: "Applicant",
        category: "Category",
        claimTitle: "Title",
        description: "Description",
        rejectedReason: "Rejected reason",
        status: "Status",
        submittedAt: "Submitted at",
        title: "Basic information",
      },
      category: {
        meal: "Meal",
        office: "Office",
        service: "Service",
        travel: "Travel",
      },
      invoices: {
        amount: "Amount",
        category: "Category",
        invoice: "Invoice",
        seller: "Seller",
        title: "Claim details",
      },
      status: {
        archived: "Abandoned",
        draft: "Draft",
        paid: "Paid",
        rejected: "Rejected",
        submitted: "In review",
      },
      timeline: {
        action: {
          approved: "Approved",
          created: "Created",
          paid: "Paid",
          rejected: "Rejected",
          submitted: "Submitted",
        },
        title: "Review timeline",
      },
      title: "Claim Detail",
    },
    financeReview: {
      actions: {
        refresh: "Refresh",
      },
      metrics: {
        amount: "Amount in review",
        duplicateRisk: "Duplicate risk",
        pendingClaims: "Pending claims",
        pendingInvoices: "Pending invoices",
      },
      queues: {
        claims: {
          description:
            "Review reimbursement claims, invoice details, and business context.",
          title: "Claim review",
        },
        duplicates: {
          description: "Prioritize suspected duplicate invoices.",
          title: "Duplicate risk",
        },
        invoices: {
          description: "Check OCR, duplicates, and invoice files.",
          title: "Invoice review",
        },
      },
      subtitle:
        "Handle submitted reimbursement claims and send approved claims to BOE.",
      title: "Finance Workbench",
    },
    invoiceReviewList: {
      actions: {
        refresh: "Refresh",
        review: "Review",
        workbench: "Workbench",
      },
      columns: {
        actions: "Actions",
        amount: "Amount",
        confidence: "OCR confidence",
        invoice: "Invoice",
        risk: "Risk",
        seller: "Seller",
        status: "Status",
      },
      filters: {
        all: "All statuses",
        search: "Search invoice reviews",
        searchPlaceholder: "Search by invoice ID, number, seller, or applicant",
      },
      state: {
        empty: "No matching invoice review items",
        loading: "Loading invoice review queue...",
      },
      subtitle:
        "Review OCR results, duplicate risks, and review status for submitted invoices.",
      title: "Invoice Review",
    },
    claimReviewList: {
      actions: {
        refresh: "Refresh",
        review: "Review",
        workbench: "Workbench",
      },
      columns: {
        actions: "Actions",
        amount: "Amount",
        applicant: "Applicant",
        claim: "Claim",
        invoices: "Invoices",
        status: "Status",
        submittedAt: "Submitted at",
      },
      filters: {
        all: "All statuses",
        search: "Search claim reviews",
        searchPlaceholder: "Search by claim ID, title, or applicant",
      },
      state: {
        empty: "No matching claim review items",
        loading: "Loading claim review queue...",
      },
      subtitle:
        "Review claim information, invoice details, and business descriptions.",
      title: "Claim Review",
    },
    invoiceReview: {
      actions: {
        back: "Back to invoice review",
      },
      basic: {
        amount: "Amount",
        applicant: "Applicant",
        risk: "Duplicate risk",
        seller: "Seller",
        status: "Status",
        submittedAt: "Submitted at",
        title: "Invoice information",
      },
      duplicate: {
        empty: "No duplicate invoice found.",
        hit: "Suspected duplicate invoice",
        title: "Duplicate result",
      },
      ocr: {
        confidence: "Overall confidence {{value}}",
        fieldConfidence: "Field confidence {{value}}",
        originalValue: "OCR original: {{value}}",
        title: "OCR and confirmation",
      },
      preview: {
        subtitle:
          "File preview placeholder. Presigned object storage URLs will be connected later.",
      },
      result: {
        approved: "Mock approved invoice {{invoiceId}}.",
        rejected: "Mock rejected invoice {{invoiceId}}.",
      },
      title: "Invoice Review Detail",
    },
    claimReview: {
      actions: {
        back: "Back to claim review",
      },
      basic: {
        amount: "Claim amount",
        applicant: "Applicant",
        category: "Category",
        claimTitle: "Title",
        description: "Description",
        status: "Status",
        submittedAt: "Submitted at",
        title: "Claim information",
      },
      category: {
        meal: "Meal",
        office: "Office",
        service: "Service",
        travel: "Travel",
      },
      invoices: {
        amount: "Amount",
        category: "Category",
        invoice: "Invoice",
        seller: "Seller",
        title: "Claim details",
        total: "Total",
      },
      result: {
        approved: "Approved claim {{claimId}}.",
        rejected: "Rejected claim {{claimId}}.",
      },
      title: "Claim Review Detail",
    },
    reviewDecision: {
      approve: "Approve",
      comment: "Review comment",
      commentPlaceholder: "Enter approval note or rejected reason",
      reject: "Reject",
      title: "Review decision",
    },
    reviewRisk: {
      high: "High",
      low: "Low",
      medium: "Medium",
    },
    reviewStatus: {
      approved: "Approved",
      duplicate: "Suspected duplicate",
      escalated: "Escalated",
      pending: "Pending review",
      rejected: "Rejected",
    },
    reviewTimeline: {
      action: {
        approved: "Approved",
        created: "Created",
        duplicateChecked: "Duplicate checked",
        ocrConfirmed: "OCR confirmed",
        rejected: "Rejected",
        reviewing: "Reviewing",
        submitted: "Submitted",
      },
      title: "Review timeline",
    },
    adminCommon: {
      actions: {
        refresh: "Refresh",
      },
    },
    adminOutbox: {
      actions: {
        archive: "Archive",
        replay: "Replay",
      },
      columns: {
        actions: "Actions",
        aggregate: "Aggregate",
        event: "Event",
        failedAt: "Failed at",
        retryCount: "Retries",
        routingKey: "Routing key",
        status: "Status",
      },
      filters: {
        all: "All statuses",
        search: "Search dead letters",
        searchPlaceholder: "Search by event, aggregate, routing key, or error",
      },
      metrics: {
        deadLetter: "Dead letters",
        maxRetry: "Max retries",
        retrying: "Retrying",
        total: "Events",
      },
      result: {
        archive: "Mock archived {{id}}.",
        replay: "Mock replayed {{id}}.",
      },
      state: {
        empty: "No matching outbox events",
        loading: "Loading outbox dead letters...",
      },
      status: {
        deadLetter: "Dead letter",
        resolved: "Resolved",
        retrying: "Retrying",
      },
      subtitle:
        "Handle outbox dead-letter events after MQ publish failures, with replay and archive actions.",
      title: "Outbox Dead Letters",
    },
    adminStorage: {
      actions: {
        ignore: "Ignore",
        preview: "Preview",
        retry: "Retry",
      },
      columns: {
        actions: "Actions",
        failedAt: "Failed at",
        file: "File",
        objectKey: "Object key",
        provider: "Storage",
        retryCount: "Retries",
        status: "Status",
      },
      filters: {
        all: "All statuses",
        search: "Search storage failures",
        searchPlaceholder:
          "Search by file, invoice, object key, storage, or error",
      },
      metrics: {
        failed: "Failed",
        providers: "Providers",
        retrying: "Retrying",
        total: "Failures",
      },
      result: {
        ignore: "Mock ignored {{id}}.",
        preview: "Mock opened file preview for {{id}}.",
        retry: "Mock retried {{id}}.",
      },
      state: {
        empty: "No matching storage failures",
        loading: "Loading storage failures...",
      },
      status: {
        failed: "Failed",
        ignored: "Ignored",
        retrying: "Retrying",
      },
      subtitle:
        "Inspect and retry object storage upload, archive, and preview failures.",
      title: "Storage Failures",
    },
    adminOcrTasks: {
      actions: {
        detail: "Detail",
        ignore: "Ignore",
        retry: "Retry",
      },
      columns: {
        actions: "Actions",
        failedAt: "Failed at",
        failure: "Failure",
        invoice: "Invoice / file",
        provider: "Provider",
        retryCount: "Retries",
        status: "Status",
        task: "Task",
      },
      filters: {
        all: "All statuses",
        search: "Search OCR tasks",
        searchPlaceholder:
          "Search by task, invoice, file, provider, owner, or error",
      },
      metrics: {
        dead: "Dead",
        failed: "Failed",
        retrying: "Retrying",
        total: "Tasks",
      },
      result: {
        detail: "Mock opened OCR task {{id}} detail.",
        ignore: "Mock ignored OCR task {{id}}.",
        retry: "Mock retried OCR task {{id}}.",
      },
      state: {
        empty: "No matching OCR tasks",
        loading: "Loading failed OCR tasks...",
      },
      status: {
        dead: "Dead",
        failed: "Failed",
        ignored: "Ignored",
        retrying: "Retrying",
      },
      subtitle:
        "Inspect failed OCR recognition sessions and simulate retry or ignore operations.",
      title: "Failed OCR Tasks",
    },
    adminSecurityAudit: {
      actions: {
        export: "Export",
        trace: "Trace",
      },
      columns: {
        action: "Action",
        actions: "Actions",
        actor: "Actor",
        occurredAt: "Occurred at",
        resource: "Resource",
        result: "Result",
        risk: "Risk",
        sourceIp: "Source IP",
      },
      filters: {
        all: "All risks",
        search: "Search audit logs",
        searchPlaceholder: "Search by action, actor, resource, IP, or traceId",
      },
      metrics: {
        actors: "Actors",
        blocked: "Blocked",
        highRisk: "High risk",
        total: "Audit logs",
      },
      result: {
        export: "Mock exported current security audit results.",
        trace: "Mock opened trace {{traceId}}.",
      },
      resultStatus: {
        blocked: "Blocked",
        failed: "Failed",
        success: "Success",
      },
      risk: {
        high: "High",
        low: "Low",
        medium: "Medium",
      },
      state: {
        empty: "No matching security audit logs",
        loading: "Loading security audit logs...",
      },
      subtitle:
        "Query sensitive operations, blocked sign-ins, unauthorized access, and configuration audit logs.",
      title: "Security Audit",
    },
    adminSystemConfig: {
      actions: {
        save: "Save config",
        test: "Test connection",
      },
      fields: {
        mq: {
          deadLetterExchange: "Dead letter exchange",
          domainEventsExchange: "Domain events exchange",
          host: "RabbitMQ address",
          integrationEventsExchange: "Integration events exchange",
          maxAttempts: "Max attempts",
          outboxRoutingKey: "Outbox routing key",
          password: "Password",
          port: "Port",
          provider: "MQ type",
          username: "Username",
          virtualHost: "Virtual host",
        },
        ocr: {
          endpoint: "Endpoint",
          host: "Host",
          lowConfidenceThreshold: "Low confidence threshold",
          maxAttempts: "Max attempts",
          mockEnabled: "Mock enabled",
          provider: "OCR provider",
          region: "Region",
          secretId: "SecretId",
          secretKey: "SecretKey",
          tencentEnabled: "Tencent enabled",
          timeoutSeconds: "Timeout seconds",
          token: "Token",
        },
        security: {
          auditLevel: "Audit level",
          clientId: "Client ID",
          clientSecret: "Client secret",
          issuer: "OIDC Issuer",
          loginBlockEnabled: "Login block enabled",
          maxLoginFailures: "Max login failures",
          nonceTtlSeconds: "Nonce TTL seconds",
          realm: "Realm",
          sessionTtlMinutes: "Session TTL minutes",
        },
        storage: {
          accessKeyId: "AccessKey ID",
          bucket: "Bucket",
          downloadExpiresMinutes: "Download URL minutes",
          endpoint: "Endpoint",
          localRoot: "Local root",
          maxSizeMb: "Max size MB",
          previewExpiresMinutes: "Preview URL minutes",
          provider: "Storage type",
          region: "Region",
          secretAccessKey: "Secret access key",
          storageType: "Storage type",
        },
      },
      metrics: {
        environment: "Environment",
        masked: "Masked fields",
        sections: "Sections",
        status: "Status",
      },
      result: {
        save: "System configuration saved.",
        test: "Configuration connectivity test completed.",
      },
      sections: {
        mq: {
          title: "RabbitMQ",
        },
        ocr: {
          title: "OCR",
        },
        security: {
          title: "Security",
        },
        storage: {
          title: "Object storage",
        },
      },
      status: {
        active: "Active",
      },
      subtitle:
        "Maintain tenant-level OCR, object storage, MQ, and security policy settings.",
      title: "System Config",
    },
  },
} as const;
