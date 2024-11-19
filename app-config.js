module.exports = {
    "development":{
         "model": "gpt-4o-mini",
         "url": "https://api.openai.com/v1/chat/completions",
         "gpt_api": {
            "spell_check": {
                "body": {
                    "response_format": {
                      "type": "json_schema",
                      "json_schema": {
                        "name": "spell_check",
                        "schema": {
                          "type": "object",
                          "properties": {
                            "word_list": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "wrong_word": { "type": "string" },
                                  "corrected_word": { "type": "string" }
                                },
                                "required": ["wrong_word", "corrected_word"],
                                "additionalProperties": false
                              }
                            }
                          },
                          "required": ["word_list"],
                          "additionalProperties": false
                        },
                        "strict": true
                      }
                    }
                }
            },
            "question_answer": {
                "body": {
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "question_answer",
                            "schema": {
                            "type": "object",
                            "properties": {
                                "answer": {
                                    "type": "string"
                                }
                            },
                            "required": ["answer"],
                            "additionalProperties": false
                            },
                            "strict": true
                        }
                    }
                }
            },
            "generate_content": {
                "body": {
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "question_answer",
                            "schema": {
                            "type": "object",
                            "properties": {
                                "answer": {
                                "type": "string"
                                }
                            },
                            "required": ["answer"],
                            "additionalProperties": false
                            },
                            "strict": true
                        }
                    }
                }
            }
         }
    },
    "production":{
        "model": "gpt-4o-mini",
        "url": "https://api.openai.com/v1/chat/completions",
        "gpt_api": {
           "spell_check": {
               "body": {
                   "response_format": {
                     "type": "json_schema",
                     "json_schema": {
                       "name": "spell_check",
                       "schema": {
                         "type": "object",
                         "properties": {
                           "word_list": {
                             "type": "array",
                             "items": {
                               "type": "object",
                               "properties": {
                                 "wrong_word": { "type": "string" },
                                 "corrected_word": { "type": "string" }
                               },
                               "required": ["wrong_word", "corrected_word"],
                               "additionalProperties": false
                             }
                           }
                         },
                         "required": ["word_list"],
                         "additionalProperties": false
                       },
                       "strict": true
                     }
                   }
               }
           },
           "question_answer": {
               "body": {
                   "response_format": {
                       "type": "json_schema",
                       "json_schema": {
                           "name": "question_answer",
                           "schema": {
                           "type": "object",
                           "properties": {
                               "answer": {
                                   "type": "string"
                               }
                           },
                           "required": ["answer"],
                           "additionalProperties": false
                           },
                           "strict": true
                       }
                   }
               }
           },
           "generate_content": {
               "body": {
                   "response_format": {
                       "type": "json_schema",
                       "json_schema": {
                           "name": "question_answer",
                           "schema": {
                           "type": "object",
                           "properties": {
                               "answer": {
                               "type": "string"
                               }
                           },
                           "required": ["answer"],
                           "additionalProperties": false
                           },
                           "strict": true
                       }
                   }
               }
           }
        }
   }
}