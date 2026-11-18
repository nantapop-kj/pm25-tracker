package helper

import (
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

func Validate(s any) error {
	v := validator.New()
	err := v.Struct(s)
	if err == nil {
		return nil
	}

	var errs validator.ValidationErrors
	if !errors.As(err, &errs) {
		return fmt.Errorf("validate %T: %w", s, err)
	}
	msgs := make([]string, 0, len(errs))
	for _, fe := range errs {
		rule := fe.Tag()
		if fe.Param() != "" {
			rule += "=" + fe.Param()
		}
		msgs = append(msgs, fmt.Sprintf("%s failed %q (got %v)", fe.Namespace(), rule, fe.Value()))
	}

	return errors.New(strings.Join(msgs, "; "))
}
