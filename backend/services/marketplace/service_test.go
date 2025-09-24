package marketplace

// Flow14.1.1

import "testing"

func TestParseStringArrayJSON(t *testing.T) {
    cases := []struct{
        in []byte
        want []string
    }{
        {[]byte(`[]`), nil},
        {[]byte(`["a","b","c"]`), []string{"a","b","c"}},
        {[]byte(` [ "x" , "y" ] `), []string{"x","y"}},
        {nil, nil},
    }
    for i, c := range cases {
        got := parseStringArrayJSON(c.in)
        if len(got) != len(c.want) {
            t.Fatalf("case %d: len=%d want=%d", i, len(got), len(c.want))
        }
        for j := range got {
            if got[j] != c.want[j] {
                t.Fatalf("case %d item %d: got %q want %q", i, j, got[j], c.want[j])
            }
        }
    }
}


