- name: pusher
  type: ini
  filename: copy
  quote: Test
  author: HCLonely
  body:
    token:
      name: Token
      desp: This is token
      required: true
      type: text
      defaultValue:
      placeholder: Input your token
      inputType: text
      validation: '^[\w]+$'
    id:
      name: id
      desp: This is id
      required: true
      type: text
      defaultValue: 111
      placeholder: Input your id
      inputType: number
    textarea:
      name: textarea
      desp: This is textarea
      required: true
      type: text
      defaultValue:
      placeholder: Input your token
      inputType: textarea
    array:
      name: arrayName
      desp: This is array
      required: true
      type: array
      body:
        - name: id
          desp: This is id
          required: true
          type: text
          defaultValue: 111
          placeholder: Input your id
          inputType: number
        - name: arrayName
          desp: This is array
          required: true
          type: array
          repeat: 3
          body:
            - name: id
              desp: This is id
              required: true
              type: text
              defaultValue: 111
              placeholder: Input your id
              inputType: number
            - name: arrayName
              desp: This is array
              required: true
              type: array
              repeat: 3
              body:
                - name: id
                  desp: This is id
                  required: true
                  type: text
                  defaultValue: 111
                  placeholder: Input your id
                  inputType: number
        - name: textarea
          desp: This is textarea
          required: true
          type: text
          defaultValue:
          placeholder: Input your token
          inputType: textarea
          repeat: true
        - name: object
          desp: object
          required: true
          type: object
          repeat: true
          body:
            token:
              name: Test
              desp: Testing
              required: true
              type: boolean
              defaultValue:
            select:
              name: Select
              desp: Testing
              required: false
              type: single-select
              defaultValue: 2
              options:
                - a
                - 2
                - 3
- name: test
  type: yaml
  body:
    token:
      name: Test
      desp: Testing
      required: true
      type: boolean
      defaultValue:
    select:
      name: Select
      desp: Testing
      required: false
      type: single-select
      defaultValue: 2
      options:
        - a
        - 2
        - 3
      bindValue:
        type: object
        body:
          a:
            keyA:
              name: keyA
              type: object
              body:
                tokenA:
                  name: tokenA
                  type: text
          2:
            key2:
              name:key2
              type: object
              body:
                token:
                  name2: token2
                  type: text
    select2:
      name: Select2
      desp: Testing2
      required: false
      type: multi-select
      defaultValue:
        - a
        - 2
      optionsName:
        - A
        - B
        - C
        - D
      options:
        - a
        - 2
        - 3
        - s
    object:
      name: object
      desp: object
      required: true
      type: object
      body:
        token:
          name: Test
          desp: Testing
          required: true
          type: boolean
          defaultValue:
        select:
          name: Select
          desp: Testing
          required: false
          type: single-select
          defaultValue: 2
          options:
            - a
            - 2
            - 3
